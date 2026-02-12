/**
 * Центральный каталог товаров.
 * Локальные товары — из catalog_*.ts. XML — подмешиваются через combineProducts в CatalogPage/ProductPage.
 * Можно менять: локальные товары в catalog_bryce, catalog_soho и т.д.
 * Не менять: интерфейсы Product, combineProducts, getCollectionIdFromName — от них зависит API.
 */
import { artDecoProducts } from './catalog_art-deco';
import { bryceProducts } from './catalog_bryce';
import { gvenProducts } from './catalog_gven';
import { sohoProducts } from './catalog_soho';
import { sydneyProducts } from './catalog_sydney';
import { diningGroupsProducts } from './catalog_dining-groups';

export interface ProductSpecs {
  material: string;
  dimensions: string;
  weight: string;
}

export interface ProductVariant {
  article: string;
  material: string;
  price: string;
}

export interface Product {
  id: number;
  uid?: string;
  name: string;
  price: string;
  image: string;
  images: string[];
  collection: string;
  category: string;
  specs: ProductSpecs;
  article?: string;
  variants?: ProductVariant[];
  source?: 'local' | 'xml';
}

export interface Category {
  id: string;
  name: string;
  nameRu: string;
}

export interface CollectionCategories {
  [collectionId: string]: Category[];
}

export const getProductImages = (product: Product): string[] => {
  const mainImage = product.image;
  const uniqueImages = new Set<string>([mainImage]);
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => uniqueImages.add(img));
  } else {
    if (!product) return [];
    const basePath = product.image.substring(0, product.image.lastIndexOf('/') + 1);
    const imageName = product.image.substring(product.image.lastIndexOf('/') + 1);
    const productName = imageName.split('-')[0];
    const generatedImages = [
      `${basePath}${productName}-1.webp`,
      `${basePath}${productName}-2.webp`,
      `${basePath}${productName}-3.webp`,
    ];
    
    generatedImages.forEach(img => uniqueImages.add(img));
  }

  return Array.from(uniqueImages);
};

export interface Collection {
  name: string;
  russianName: string;
  description: string;
}

export interface Collections {
  [key: string]: Collection;
}

const rawProducts: Product[] = [
  ...artDecoProducts,
  ...bryceProducts,
  ...gvenProducts,
  ...sohoProducts,
  ...sydneyProducts,
  ...diningGroupsProducts
];

export const products: Product[] = rawProducts.map(product => ({
  ...product,
  uid: `${product.collection.replace(/\s+/g, '-')}-${product.id}`,
  source: 'local' as const
}));

export const collections: Collections = {
  'soho': {
    name: 'Soho',
    russianName: 'контемпорари европейская',
    description: 'Элегантная мебель в стиле французского прованса'
  },
  'bryce': {
    name: 'Bryce',
    russianName: 'фрезерованные фасады тренд',
    description: 'Лаконичные формы, функциональность и стиль'
  },
  'art deco': {
    name: 'Art Deco',
    russianName: 'модерн геометрические',
    description: 'Мебель для отдыха и расслабления'
  },
  'sydney': {
    name: 'Sydney',
    russianName: 'натуральный массив латунная',
    description: 'Брутальная красота промышленной эстетики'
  },
  'gven': {
    name: 'Gven',
    russianName: 'минимализм натуральное',
    description: 'Философия северного уюта, воплощённая в мебели'
  },
  'dining groups': {
    name: 'Dining Groups',
    russianName: 'Столовые группы',
    description: 'Элегантные столы и стулья для создания уютной столовой зоны'
  }
};

export const collectionCategories: CollectionCategories = {
  'bryce': [
    { id: 'vitriny', name: 'vitriny', nameRu: 'Витрины / Шкафы' },
    { id: 'komody', name: 'komody', nameRu: 'Комоды' },
    { id: 'stoly', name: 'stoly', nameRu: 'Столы' },
    { id: 'tumby', name: 'tumby', nameRu: 'Тумбы' },
    { id: 'konsoli', name: 'konsoli', nameRu: 'Консоли' },
    { id: 'zerkala', name: 'zerkala', nameRu: 'Зеркала' },
    { id: 'krovati', name: 'krovati', nameRu: 'Кровати' },
    { id: 'stelazhi', name: 'stelazhi', nameRu: 'Стелажи' },
  ],
  'soho': [
    { id: 'stoly', name: 'stoly', nameRu: 'Столы' },
    { id: 'stulya', name: 'stulya', nameRu: 'Стулья' },
    { id: 'komody', name: 'komody', nameRu: 'Комоды' },
    { id: 'tumby', name: 'tumby', nameRu: 'Тумбы' },
    { id: 'zerkala', name: 'zerkala', nameRu: 'Зеркала' },
    { id: 'banketki', name: 'banketki', nameRu: 'Банкетки' },
    { id: 'taburety', name: 'taburety', nameRu: 'Табуреты' },
  ],
  'art-deco': [
    { id: 'stoly', name: 'stoly', nameRu: 'Столы' },
     { id: 'tumby', name: 'tumby', nameRu: 'Тумбы' },
     { id: 'konsoli', name: 'konsoli', nameRu: 'Консоли' },
      { id: 'zerkala', name: 'zerkala', nameRu: 'Зеркала' },
    { id: 'komody', name: 'komody', nameRu: 'Комоды' },
    { id: 'vitriny', name: 'vitriny', nameRu: 'Витрины / Шкафы' }
  ],
  'sydney': [
    { id: 'vitriny', name: 'vitriny', nameRu: 'Витрины / Шкафы' },
    { id: 'komody', name: 'komody', nameRu: 'Комоды' },
    { id: 'konsoli', name: 'konsoli', nameRu: 'Консоли' },
      { id: 'krovati', name: 'krovati', nameRu: 'Кровати' },
    { id: 'tumby', name: 'tumby', nameRu: 'Тумбы' }
  ],
  'gven': [
     { id: 'vitriny', name: 'vitriny', nameRu: 'Витрины / Шкафы' },
    { id: 'komody', name: 'komody', nameRu: 'Комоды' },
     { id: 'konsoli', name: 'konsoli', nameRu: 'Консоли' },
         { id: 'zerkala', name: 'zerkala', nameRu: 'Зеркала' },
    { id: 'stoly', name: 'stoly', nameRu: 'Столы' },
    { id: 'tumby', name: 'tumby', nameRu: 'Тумбы' }
  ],
  'dining-groups': [
    { id: 'stoly', name: 'stoly', nameRu: 'Столы' },
    { id: 'stulya', name: 'stulya', nameRu: 'Стулья' }
  ]
};

export const getCollectionIdFromName = (name: string): string | null => {
  const collectionName = name.toLowerCase().replace(/-/g, ' ');
  return collections[collectionName] ? collectionName : null;
};

export const getCollectionDisplayName = (collectionId: string): string => {
  if (!collectionId) return '';
  const withSpaces = collectionId.replace(/-/g, ' ');
  if (collections[withSpaces]) return collections[withSpaces].name;
  if (collections[collectionId]) return collections[collectionId].name;
  return collectionId.charAt(0).toUpperCase() + collectionId.slice(1).replace(/-/g, ' ');
};

export const detectCategoryFromName = (productName: string): string => {
  const name = productName.toLowerCase();
  
  const keywords: { [key: string]: string } = {
    'тумба': 'tumby',
    'комод': 'komody',
    'стол': 'stoly',
    'стул': 'stulya',
    'табурет': 'taburety',
    'консоль': 'konsoli',
    'витрина': 'vitriny',
    'шкаф': 'vitriny',
    'кровать': 'krovati',
    'зеркало': 'zerkala',
    'банкетка': 'banketki',
    'стеллаж': 'stelazhi',
    'диван': 'divani',
    'пуф': 'poufi',
    'поуф': 'poufi'
  };

  for (const [keyword, category] of Object.entries(keywords)) {
    if (name.includes(keyword)) {
      return category;
    }
  }

  return 'other';
};

export const combineProducts = (localProducts: Product[], xmlProducts: Product[]): Product[] => {
  const shouldExcludeProduct = (p: Product) => {
    if (p.article && String(p.article) === '728918') return true;
    if (p.variants && p.variants.some((v) => String(v.article) === '728918')) return true;
    return false;
  };

  const normalizeCategory = (categoryId: string) => {
    if (categoryId === 'shkafy') return 'vitriny';
    return categoryId;
  };

  if (xmlProducts && xmlProducts.length > 0) {
    const normalizeCollection = (collection: string) =>
      collection.toLowerCase().trim().replace(/\s+/g, '-');

    const isSoftFurnitureCollection = (collection: string) => {
      const c = collection.toLowerCase();
      return c.includes('мягк') || c.includes('soft');
    };

    const filteredXml = xmlProducts.filter((p) => !shouldExcludeProduct(p));
    const filteredLocal = localProducts.filter((p) => !shouldExcludeProduct(p));

    const normalizedXml = filteredXml.map((p, index) => {
      const rawCategory = !p.category || p.category === 'other'
        ? detectCategoryFromName(p.name)
        : p.category;
      let category = normalizeCategory(rawCategory);
      if (isSoftFurnitureCollection(p.collection) && category === 'krovati') {
        category = 'other';
      }

      const uid = p.uid || `${p.collection.replace(/\s+/g, '-')}-${p.id ?? index}`;

      return {
        ...p,
        uid,
        category,
        source: 'xml' as const,
      };
    });

    const xmlCollections = new Set(normalizedXml.map((p) => normalizeCollection(p.collection)));
    const existingKeys = new Set(
      normalizedXml.map((p) => p.uid || p.article || `${normalizeCollection(p.collection)}|${p.name.toLowerCase()}`),
    );

    const localFallback = filteredLocal
      .filter((p) => !xmlCollections.has(normalizeCollection(p.collection)))
      .filter((p) => {
        const key = p.uid || p.article || `${normalizeCollection(p.collection)}|${p.name.toLowerCase()}`;
        if (existingKeys.has(key)) return false;
        existingKeys.add(key);
        return true;
      });

    return [...normalizedXml, ...localFallback];
  }
  return localProducts.filter((p) => !shouldExcludeProduct(p));
};
