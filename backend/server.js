import express from 'express';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import cors from 'cors';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const OVERRIDES_FILE = path.join(DATA_DIR, 'product-overrides.json');
const NOTIFICATION_SETTINGS_FILE = path.join(DATA_DIR, 'notification-settings.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');

const SALT_ROUNDS = 10;
const TOKEN_BYTES = 32;
const adminTokens = new Map();

function generateToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readOrders() {
  ensureDataDir();
  if (!fs.existsSync(ORDERS_FILE)) return [];
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.warn('readOrders error', e);
    return [];
  }
}

function writeOrders(orders) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

function readOverrides() {
  ensureDataDir();
  if (!fs.existsSync(OVERRIDES_FILE)) return {};
  try {
    const data = fs.readFileSync(OVERRIDES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.warn('readOverrides error', e);
    return {};
  }
}

function writeOverrides(overrides) {
  ensureDataDir();
  fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides, null, 2), 'utf8');
}

function readNotificationSettings() {
  ensureDataDir();
  if (!fs.existsSync(NOTIFICATION_SETTINGS_FILE)) {
    return { telegramBotToken: '', telegramChatId: '', email: '' };
  }
  try {
    const data = fs.readFileSync(NOTIFICATION_SETTINGS_FILE, 'utf8');
    return { ...{ telegramBotToken: '', telegramChatId: '', email: '' }, ...JSON.parse(data) };
  } catch (e) {
    console.warn('readNotificationSettings error', e);
    return { telegramBotToken: '', telegramChatId: '', email: '' };
  }
}

function writeNotificationSettings(settings) {
  ensureDataDir();
  fs.writeFileSync(NOTIFICATION_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
}

const DEFAULT_ADMIN_LOGIN = 'mzykovich@mail.ru';
const DEFAULT_ADMIN_PASSWORD = 'Gfhjkm11';

function readAdmins() {
  ensureDataDir();
  if (!fs.existsSync(ADMINS_FILE)) return [];
  try {
    const raw = fs.readFileSync(ADMINS_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data.admins) ? data.admins : [];
  } catch (e) {
    console.warn('readAdmins error', e);
    return [];
  }
}

function writeAdmins(admins) {
  ensureDataDir();
  fs.writeFileSync(ADMINS_FILE, JSON.stringify({ admins }, null, 2), 'utf8');
}

function ensureDefaultAdmin() {
  let admins = readAdmins();
  if (admins.length === 0) {
    const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, SALT_ROUNDS);
    admins = [{ login: DEFAULT_ADMIN_LOGIN, passwordHash }];
    writeAdmins(admins);
  }
}

async function sendTelegramOrderNotification(order, telegramBotToken, telegramChatId) {
  if (!telegramBotToken || !telegramChatId) return;
  const lines = [
    `🛒 Новый заказ #${order.id}`,
    `👤 ${order.customerName}`,
    `📞 ${order.phone}`,
    ...(order.email ? [`📧 ${order.email}`] : []),
    ...(order.deliveryAddress ? [`📍 Адрес доставки: ${order.deliveryAddress}`] : []),
    ...(order.comment ? [`💬 ${order.comment}`] : []),
    '',
    'Товары:',
    ...order.items.map((i) => `• ${i.name} × ${i.quantity} — ${i.price}`),
  ];
  const text = lines.join('\n');
  try {
    await axios.get(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      params: { chat_id: telegramChatId, text },
      timeout: 10000,
    });
  } catch (e) {
    console.error('Telegram notification error:', e.message);
  }
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendEmailOrderNotification(order, toEmail) {
  if (!toEmail || !toEmail.includes('@')) return;
  const transporter = getMailTransporter();
  if (!transporter) {
    console.warn('Email notification skipped: SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS in .env)');
    return;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const lines = [
    `Новый заказ #${order.id}`,
    `Дата: ${new Date(order.createdAt).toLocaleString('ru-RU')}`,
    '',
    `Клиент: ${order.customerName}`,
    `Телефон: ${order.phone}`,
    ...(order.email ? [`Email: ${order.email}`] : []),
    ...(order.deliveryAddress ? [`Адрес доставки: ${order.deliveryAddress}`] : []),
    ...(order.comment ? [`Комментарий: ${order.comment}`] : []),
    '',
    'Товары:',
    ...order.items.map((i) => `  • ${i.name} × ${i.quantity} — ${i.price}`),
  ];
  const text = lines.join('\r\n');
  const html = `<div style="font-family: sans-serif; max-width: 600px;">
    ${lines.map((l) => `<p style="margin: 0.4em 0;">${String(l).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join('')}
  </div>`;
  try {
    await transporter.sendMail({
      from,
      to: toEmail,
      subject: `Новый заказ #${order.id} — ${order.customerName}`,
      text,
      html,
    });
  } catch (e) {
    console.error('Email notification error:', e.message);
  }
}

function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const login = adminTokens.get(token);
  if (login) {
    req.adminLogin = login;
    return next();
  }
  res.status(401).json({ success: false, error: 'Требуется авторизация' });
}

app.use(cors());
app.use(express.json());

let cachedProducts = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000;

function getParamValue(offer, ...paramNames) {
  const params = offer.param;
  if (!params) return null;
  const arr = Array.isArray(params) ? params : [params];
  for (const p of arr) {
    const name = (p.$ && p.$.name) || null;
    const val = (typeof p._ === 'string' ? p._ : (p._ && p._[0])) || null;
    if (!name || !val) continue;
    const nameLower = String(name).toLowerCase();
    const match = paramNames.some(n => nameLower === n.toLowerCase() || nameLower.includes(n.toLowerCase()));
    if (match) return String(val).trim();
  }
  return null;
}

function parseDescriptionSpecs(description) {
  if (!description) return {};
  const text = String(description);
  const specs = {};

  // Material: ищем "Материал: ..." до <, точки или переноса строки
  const matMatch = text.match(/Материал:\s*([^<.\n\r]+)/i);
  if (matMatch) specs.material = matMatch[1].trim();

  // Color: ищем "Цвет: ..."
  const colMatch = text.match(/Цвет:\s*([^<.\n\r]+)/i);
  if (colMatch) specs.color = colMatch[1].trim();

  // Weight from table: <td>Вес...</td><td>VALUE</td>
  const weightMatch = text.match(/<td>(?:Вес|Weight|Вес_1С)<\/td>\s*<td>\s*([\d,\.]+)\s*<\/td>/i);
  if (weightMatch) specs.weight = weightMatch[1].trim();

  // Dimensions: Priority 1 - ШВГ (Width/Height/Depth)
  const shvgMatch = text.match(/<td>ШВГ<\/td>\s*<td>\s*([\d\.\/]+)\s*<\/td>/i);
  if (shvgMatch) {
    const parts = shvgMatch[1].split('/').map(s => s.trim());
    if (parts.length === 3) {
      // ШВГ = Ширина / Высота / Глубина
      // Output format: Ширина x Глубина x Высота
      specs.dimensions = `${parts[0]} x ${parts[2]} x ${parts[1]} см`;
    }
  }

  // Dimensions: Priority 2 - Individual fields
  if (!specs.dimensions) {
    const getVal = (key) => {
      const m = text.match(new RegExp(`<td>${key}<\\/td>\\s*<td>\\s*([\\d\\.,]+)\\s*<\\/td>`, 'i'));
      return m ? parseFloat(m[1].replace(',', '.')) : null;
    };

    const w = getVal('Ширина');
    const h = getVal('Высота');
    const d = getVal('Глубина');

    if (w || h || d) {
      // Heuristic: if values are > 100, likely mm, convert to cm
      const fmt = (v) => {
        if (!v) return null;
        return (v > 100 ? parseFloat((v / 10).toFixed(1)) : v).toString();
      };
      
      const dims = [];
      if (w) dims.push(fmt(w));
      if (d) dims.push(fmt(d)); // Depth second
      if (h) dims.push(fmt(h)); // Height third
      
      if (dims.length > 0) specs.dimensions = dims.join(' x ') + ' см';
    }
  }

  return specs;
}

function convertXmlOfferToProduct(offer, categoriesMap) {
  const offerData = offer.$ || {};
  const id = parseInt(offerData.id) || 0;
  const categoryIds = Array.isArray(offer.categoryId) 
    ? offer.categoryId.map(c => c._ || c)
    : offer.categoryId ? [offer.categoryId._ || offer.categoryId] : [];
  const typePrefix = offer.typePrefix?.[0]?._ || offer.typePrefix?.[0] || '';
  const collection = typePrefix.toLowerCase().replace(/\s+/g, '-') || 'external';
  const category = categoryIds.length > 0 
    ? categoriesMap[categoryIds[0]]?.toLowerCase() || 'other'
    : 'other';
  const pictures = Array.isArray(offer.picture)
    ? offer.picture.map(p => p._ || p)
    : offer.picture ? [offer.picture._ || offer.picture] : [];
  
  const mainImage = pictures[0] || '';
  const images = pictures.length > 0 ? pictures : [mainImage];
  const priceValue = offer.price?.[0]?._ || offer.price?.[0] || '0';
  const price = formatPrice(priceValue);
  const name = offer.name?.[0]?._ || offer.name?.[0] || offer.model?.[0]?._ || offer.model?.[0] || 'Товар без названия';
  const article = offer.vendorCode?.[0]?._ || offer.vendorCode?.[0] || '';
  
  // Extract description and specs from it
  const description = offer.description?.[0]?._ || offer.description?.[0] || '';
  const descSpecs = parseDescriptionSpecs(description);

  let material = offer.material?.[0]?._ ?? offer.material?.[0];
  if (!material) material = getParamValue(offer, 'Материал', 'Material');
  if (!material) material = descSpecs.material;
  material = material || 'Не указан';

  let dimensions = offer.dimensions?.[0]?._ ?? offer.dimensions?.[0];
  if (!dimensions || /не указан/i.test(String(dimensions))) {
    dimensions = getParamValue(offer, 'Размеры', 'Dimensions', 'Габариты');
  }
  if ((!dimensions || /не указан/i.test(String(dimensions))) && descSpecs.dimensions) {
    dimensions = descSpecs.dimensions;
  }
  if (!dimensions || /не указан/i.test(String(dimensions))) {
    const shirina = getParamValue(offer, 'Ширина', 'Width');
    const glubina = getParamValue(offer, 'Глубина', 'Depth', 'Length', 'Длина');
    const vysota = getParamValue(offer, 'Высота', 'Height');
    const parts = [shirina, glubina, vysota].filter(Boolean);
    if (parts.length > 0) {
      dimensions = parts.map(p => String(p).replace(/\s*см\s*$/i, '').trim()).join(' x ') + ' см';
    }
  }
  dimensions = dimensions || 'Не указаны';

  let weight = offer.weight?.[0]?._ ?? offer.weight?.[0];
  if (!weight) weight = getParamValue(offer, 'Вес', 'Weight');
  if (!weight) weight = descSpecs.weight;
  weight = weight ? String(weight).replace(/\s*кг\s*$/i, '').trim() : null;
  
  let color = getParamValue(offer, 'Цвет', 'Color');
  if (!color) color = descSpecs.color;
  color = color || 'Не указан';

  return {
    id: id,
    uid: `external-${id}`,
    name: name,
    price: price,
    image: mainImage,
    images: images,
    collection: collection,
    category: category,
    specs: {
      material: material,
      dimensions: dimensions,
      weight: weight ? `${weight} кг` : 'Не указан',
      color: color
    },
    article: article,
    source: 'xml'
  };
}

function formatPrice(price) {
  const numPrice = parseInt(price);
  if (isNaN(numPrice)) return '0 ₽';
  return numPrice.toLocaleString('ru-RU') + ' ₽';
}

function mapCategory(xmlCategoryId, categoriesMap) {
  const categoryMapping = {
    '21': 'zerkala',
    '22': 'komody',
    '23': 'tumby',
    '24': 'vitriny',
    '25': 'vitriny',
    '26': 'stoly',
    '27': 'stoly',
    '28': 'vitriny',
    '29': 'tumby',
    '31': 'vitriny',
    '32': 'vitriny',
    '33': 'komody',
    '34': 'vitriny',
    '35': 'stoly',
    '36': 'tumby',
    '37': 'vitriny',
    '38': 'vitriny',
    '39': 'komody',
    '40': 'krovati',
    '41': 'vitriny',
    '42': 'tumby',
    '43': 'tumby',
    '44': 'vitriny',
    '45': 'zerkala',
  };
  return categoryMapping[xmlCategoryId] || 'other';
}

async function fetchAndParseXml() {
  try {
    const response = await axios.get('https://anrex.info/files/xml/export_mcl.xml', {
      timeout: 30000,
      headers: {
        'Accept': 'application/xml, text/xml'
      }
    });
    
    const xmlData = response.data;
    const result = await parseStringPromise(xmlData);
    const categoriesMap = {};
    if (result.yml_catalog?.shop?.[0]?.categories?.[0]?.category) {
      result.yml_catalog.shop[0].categories[0].category.forEach(cat => {
        const catId = cat.$.id;
        const catName = cat._ || cat;
        categoriesMap[catId] = catName;
      });
    }
    const offers = result.yml_catalog?.shop?.[0]?.offers?.[0]?.offer || [];
    const products = offers
      .filter(offer => offer.$.available === 'true')
      .map(offer => {
        const categoryIds = Array.isArray(offer.categoryId) 
          ? offer.categoryId.map(c => c._ || c)
          : offer.categoryId ? [offer.categoryId._ || offer.categoryId] : [];
        
        const mappedCategory = categoryIds.length > 0 
          ? mapCategory(categoryIds[0], categoriesMap)
          : 'other';
        
        const product = convertXmlOfferToProduct(offer, categoriesMap);
        product.category = mappedCategory;
        return product;
      });
    
    return products;
  } catch (error) {
    console.error('Ошибка при загрузке XML:', error.message);
    if (error.response) console.error('HTTP status:', error.response.status, error.response.statusText);
    throw error;
  }
}

app.get('/api/products/xml', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedProducts && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return res.json({
        success: true,
        products: cachedProducts,
        cached: true
      });
    }
    const products = await fetchAndParseXml();
    cachedProducts = products;
    cacheTimestamp = now;
    
    res.json({
      success: true,
      products: products,
      cached: false,
      count: products.length
    });
  } catch (error) {
    console.error('Ошибка API /api/products/xml:', error.message);
    res.status(500).json({
      success: false,
      error: 'Ошибка при загрузке продуктов из XML',
      message: error.message
    });
  }
});

app.post('/api/products/xml/refresh', async (req, res) => {
  try {
    const products = await fetchAndParseXml();
    cachedProducts = products;
    cacheTimestamp = Date.now();
    
    res.json({
      success: true,
      products: products,
      count: products.length,
      message: 'Кэш обновлен'
    });
  } catch (error) {
    console.error('Ошибка обновления:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при обновлении кэша',
      message: error.message
    });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, email, deliveryAddress, comment, items } = req.body;
    if (!customerName || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Укажите имя, телефон и хотя бы один товар',
      });
    }
    if (!deliveryAddress || !String(deliveryAddress).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Укажите адрес доставки',
      });
    }
    const orders = readOrders();
    const id = String(Date.now()) + '-' + Math.random().toString(36).slice(2, 9);
    const order = {
      id,
      createdAt: new Date().toISOString(),
      status: 'new',
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : undefined,
      deliveryAddress: String(deliveryAddress).trim(),
      comment: comment ? String(comment).trim() : undefined,
      items,
    };
    orders.push(order);
    writeOrders(orders);

    const notif = readNotificationSettings();
    if (notif.telegramBotToken && notif.telegramChatId) {
      sendTelegramOrderNotification(order, notif.telegramBotToken, notif.telegramChatId).catch(() => {});
    }
    if (notif.email) {
      sendEmailOrderNotification(order, notif.email).catch(() => {});
    }

    res.status(201).json({ success: true, order });
  } catch (e) {
    console.error('POST /api/orders', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/orders', adminAuth, (req, res) => {
  try {
    const orders = readOrders();
    res.json({ success: true, orders: orders.reverse() });
  } catch (e) {
    console.error('GET /api/orders', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.patch('/api/orders/:id', adminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'confirmed', 'completed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Недопустимый статус' });
    }
    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Заказ не найден' });
    }
    orders[index].status = status;
    writeOrders(orders);
    res.json({ success: true, order: orders[index] });
  } catch (e) {
    console.error('PATCH /api/orders/:id', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

ensureDefaultAdmin();

app.post('/api/admin/login', (req, res) => {
  const { login, password } = req.body || {};
  const loginStr = String(login || '').trim();
  const passwordStr = String(password || '');
  if (!loginStr || !passwordStr) {
    return res.status(400).json({ success: false, error: 'Укажите логин и пароль' });
  }
  ensureDefaultAdmin();
  const admins = readAdmins();
  const admin = admins.find((a) => a.login.toLowerCase() === loginStr.toLowerCase());
  if (!admin || !bcrypt.compareSync(passwordStr, admin.passwordHash)) {
    return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
  }
  const token = generateToken();
  adminTokens.set(token, admin.login);
  res.json({ success: true, token });
});

app.get('/api/admin/users', adminAuth, (req, res) => {
  try {
    const admins = readAdmins();
    res.json({ success: true, users: admins.map((a) => ({ login: a.login })) });
  } catch (e) {
    console.error('GET /api/admin/users', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/admin/users', adminAuth, (req, res) => {
  try {
    const { login, password } = req.body || {};
    const loginStr = String(login || '').trim();
    const passwordStr = String(password || '');
    if (!loginStr || !passwordStr) {
      return res.status(400).json({ success: false, error: 'Укажите логин и пароль' });
    }
    if (passwordStr.length < 6) {
      return res.status(400).json({ success: false, error: 'Пароль не менее 6 символов' });
    }
    const admins = readAdmins();
    if (admins.some((a) => a.login.toLowerCase() === loginStr.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Такой логин уже есть' });
    }
    const passwordHash = bcrypt.hashSync(passwordStr, SALT_ROUNDS);
    admins.push({ login: loginStr, passwordHash });
    writeAdmins(admins);
    res.status(201).json({ success: true, users: admins.map((a) => ({ login: a.login })) });
  } catch (e) {
    console.error('POST /api/admin/users', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/admin/users/reset-password', adminAuth, (req, res) => {
  try {
    const { login, newPassword } = req.body || {};
    const loginStr = String(login || '').trim();
    const passwordStr = String(newPassword || '');
    if (!loginStr || !passwordStr) {
      return res.status(400).json({ success: false, error: 'Укажите логин и новый пароль' });
    }
    if (passwordStr.length < 6) {
      return res.status(400).json({ success: false, error: 'Пароль не менее 6 символов' });
    }
    const admins = readAdmins();
    const index = admins.findIndex((a) => a.login.toLowerCase() === loginStr.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
    admins[index].passwordHash = bcrypt.hashSync(passwordStr, SALT_ROUNDS);
    writeAdmins(admins);
    res.json({ success: true, message: 'Пароль обновлён' });
  } catch (e) {
    console.error('POST /api/admin/users/reset-password', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/admin/notification-settings', adminAuth, (req, res) => {
  try {
    const settings = readNotificationSettings();
    res.json({ success: true, settings });
  } catch (e) {
    console.error('GET notification-settings', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.put('/api/admin/notification-settings', adminAuth, (req, res) => {
  try {
    const { telegramBotToken, telegramChatId, email } = req.body || {};
    const current = readNotificationSettings();
    const settings = {
      telegramBotToken: telegramBotToken !== undefined ? String(telegramBotToken) : current.telegramBotToken,
      telegramChatId: telegramChatId !== undefined ? String(telegramChatId) : current.telegramChatId,
      email: email !== undefined ? String(email) : current.email,
    };
    writeNotificationSettings(settings);
    res.json({ success: true, settings });
  } catch (e) {
    console.error('PUT notification-settings', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/product-overrides', (req, res) => {
  try {
    const overrides = readOverrides();
    res.json({ success: true, overrides });
  } catch (e) {
    console.error('GET /api/product-overrides', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/admin/product-overrides', adminAuth, (req, res) => {
  try {
    const overrides = readOverrides();
    res.json({ success: true, overrides });
  } catch (e) {
    console.error('GET /api/admin/product-overrides', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.put('/api/admin/product-overrides', adminAuth, (req, res) => {
  try {
    const { overrides } = req.body;
    if (overrides == null || typeof overrides !== 'object') {
      return res.status(400).json({ success: false, error: 'Нужен объект overrides' });
    }
    writeOverrides(overrides);
    res.json({ success: true, overrides: readOverrides() });
  } catch (e) {
    console.error('PUT /api/admin/product-overrides', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/products/xml`);
  console.log(`Заказы и админка: /api/orders, /api/admin/*`);
});
