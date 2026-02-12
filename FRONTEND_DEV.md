# Руководство для фронтенд-разработчика

## Как запустить проект

### 1. Установка зависимостей

```bash
cd MEBEL_FRONT
npm install
```

### 2. Запуск фронтенда

```bash
npm run dev
```

Приложение откроется по адресу `http://localhost:5173` (или другой порт, если 5173 занят).

### 3. Запуск бэкенда (для XML-товаров и заказов)

Для полной работы сайта нужен бэкенд: он отдаёт товары из XML-выгрузки, принимает заказы, админку.

```bash
cd backend
npm install
node server.js
```

Бэкенд слушает порт **3001**. API: `http://localhost:3001/api/`.

---

## Структура проекта

```
MEBEL_FRONT/
├── src/
│   ├── pages/              # Страницы приложения
│   │   ├── HomePage.tsx     # Главная
│   │   ├── CatalogPage.tsx  # Каталог
│   │   ├── CartPage.tsx    # Корзина
│   │   ├── ProductPage.tsx # Товар / коллекция
│   │   ├── CollectionsPage.tsx  # Список коллекций
│   │   └── admin/          # Админка
│   ├── components/         # Переиспользуемые компоненты
│   │   ├── Header/         # Шапка
│   │   ├── Footer/         # Подвал
│   │   ├── Hero/           # Главный слайдер
│   │   ├── Drawer/         # Боковое меню
│   │   ├── WhySM/          # Блок «Почему мы»
│   │   ├── HandCrafted/    # Блок «Производство»
│   │   ├── Txtonpic/       # «Качество и материалы»
│   │   ├── faq/            # FAQ
│   │   ├── ModalGallery/   # Галерея в модалке
│   │   └── PhoneButton/    # Кнопка звонка
│   ├── data/               # Каталог товаров (локальные)
│   │   ├── catalog.ts      # Общий каталог, коллекции, категории
│   │   ├── catalog_bryce.ts
│   │   ├── catalog_soho.ts
│   │   ├── catalog_art-deco.ts
│   │   ├── catalog_sydney.ts
│   │   ├── catalog_gven.ts
│   │   └── catalog_dining-groups.ts
│   ├── context/
│   │   └── CartContext.tsx # Состояние корзины
│   ├── types/
│   │   └── cart.ts         # Типы корзины и заказа
│   ├── utils/
│   │   ├── api.ts          # Запросы к API
│   │   └── seo.ts          # Мета-теги страниц
│   ├── styles/             # Глобальные стили
│   │   ├── variables.scss  # CSS переменные, брейкпоинты
│   │   ├── fonts.scss
│   │   └── globals.scss
│   └── assets/             # Иконки, логотипы
├── public/
│   └── images/             # Статические картинки
│       ├── Каталог/        # Фото по коллекциям (bryce, soho, etc.)
│       └── Коллекции/       # Превью коллекций
├── backend/
│   ├── server.js           # Node.js API
│   └── data/               # JSON-файлы (заказы, админы, правки товаров)
├── vite.config.ts          # Прокси /api → localhost:3001
└── .env.production         # URL API для продакшена
```

---

## Откуда берутся данные

### Товары

1. **Локальные** — лежат в `src/data/catalog_*.ts`. Объединяются в `catalog.ts` и экспортируются как `products`, `collections`, `collectionCategories`.

2. **XML** — загружаются через бэкенд с `https://anrex.info/files/xml/export_mcl.xml`. Прокси в dev: `/api` идёт на `http://localhost:3001`. Если бэкенд не запущен — XML-товары не появятся.

3. **Правки товаров** — админ может менять название, цену, картинку, акцию в админке. Сохраняется в `backend/data/product-overrides.json` и подтягивается на фронт.

### Изображения

- Локальные: `/images/Каталог/{коллекция}/{категория}/имя.png`
- Bryce: `public/images/Каталог/bryce/` — tumby, komody, konsoli, stoly, vitriny
- Остальные коллекции: `public/images/Каталог/{bocuse,bonaparte,camus,...}/`
- Коллекции: `public/images/Коллекции/` (bryce.png, soho.png, artdeco.png и т.д.)

---

## Маршруты

| Путь | Описание |
|------|----------|
| `/` | Главная |
| `/catalog` | Каталог |
| `/collections` | Список коллекций |
| `/collections/:collectionName` | Товары коллекции |
| `/product/:uid` | Карточка товара |
| `/cart` | Корзина |
| `/admin` | Вход в админку |
| `/admin/orders` | Заказы |
| `/admin/products` | Правки товаров |
| `/admin/settings` | Уведомления (Telegram, email) |
| `/admin/users` | Пользователи админки |

---

## Что можно менять без риска

- Тексты на главной, в Hero, WhySM, HandCrafted, FAQ
- Стили: `*.module.scss`, `variables.scss`, `globals.scss`
- Локальные товары: `src/data/catalog_*.ts`
- Картинки в `public/images/`

## Что лучше не трогать (если не понимаете логику)

- `backend/server.js` — парсинг XML, заказы, админка
- `src/utils/api.ts` — структура запросов к API
- `src/context/CartContext.tsx` — логика корзины
- `src/data/catalog.ts` — структура Product, combineProducts, collectionCategories
- `vite.config.ts` — прокси `/api`

---

## Переменные окружения

- **Разработка**: `VITE_API_URL` не нужна — используется прокси Vite.
- **Продакшен**: в `.env.production` задаётся `VITE_API_URL` (URL бэкенда).

---

## Сборка и деплой

```bash
npm run build
```

Результат в папке `dist/`. Для деплоя на Netlify/Timeweb используется `netlify.toml`; статика отдаётся с фронта, `/api` проксируется на бэкенд.
