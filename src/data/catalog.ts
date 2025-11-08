// Типы данных для каталога
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
  name: string;
  price: string;
  image: string;
  images: string[]; // Добавляем массив изображений
  collection: string;
  category: string;
  specs: ProductSpecs;
  article?: string; // Артикул товара (опциональный)
  variants?: ProductVariant[]; // Варианты товара
}

// Интерфейсы для категорий
export interface Category {
  id: string;
  name: string;
  nameRu: string;
}

export interface CollectionCategories {
  [collectionId: string]: Category[];
}

// Функция для получения всех изображений товара
export const getProductImages = (product: Product): string[] => {
  // Если у товара есть массив images, используем его
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  
  // Иначе используем старую логику
  if (!product) return [];
  
  // Получаем базовый путь к папке с изображениями
  const basePath = product.image.substring(0, product.image.lastIndexOf('/') + 1);
  const imageName = product.image.substring(product.image.lastIndexOf('/') + 1);
  const productName = imageName.split('-')[0];
  
  // Формируем массив из 3 изображений (предполагаем, что у каждого товара есть 3 фото)
  return [
    `${basePath}${productName}-1.webp`,
    `${basePath}${productName}-2.webp`,
    `${basePath}${productName}-3.webp`,
  ];
};

export interface Collection {
  name: string;
  russianName: string;
  description: string;
}

export interface Collections {
  [key: string]: Collection;
}

// Импортируем товары из отдельных файлов коллекций
import { artDecoProducts } from './catalog_art-deco';
import { bryceProducts } from './catalog_bryce';
import { gvenProducts } from './catalog_gven';
import { sohoProducts } from './catalog_soho';
import { sydneyProducts } from './catalog_sydney';
import { diningGroupsProducts } from './catalog_dining-groups';

// Объединяем все товары в один массив
export const products: Product[] = [
  ...artDecoProducts,
  ...bryceProducts,
  ...gvenProducts,
  ...sohoProducts,
  ...sydneyProducts,
  ...diningGroupsProducts
];

// Данные о коллекциях - обновлены для соответствия новой структуре URL
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

// Категории для каждой коллекции
export const collectionCategories: CollectionCategories = {
  'bryce': [
    { id: 'vitriny', name: 'vitriny', nameRu: 'Витрины' },
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
    { id: 'vitriny', name: 'vitriny', nameRu: 'Витрины' }
  ],
  'sydney': [
    { id: 'vitriny', name: 'vitriny', nameRu: 'Витрины' },
    { id: 'komody', name: 'komody', nameRu: 'Комоды' },
    { id: 'konsoli', name: 'konsoli', nameRu: 'Консоли' },
      { id: 'krovati', name: 'krovati', nameRu: 'Кровати' },
    { id: 'tumby', name: 'tumby', nameRu: 'Тумбы' }
  ],
  'gven': [
     { id: 'vitriny', name: 'vitriny', nameRu: 'Витрины' },
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

// Функция для преобразования названия коллекции в ID
export const getCollectionIdFromName = (name: string): string | null => {
  // Преобразуем URL-friendly название обратно в ключ коллекции
  // Заменяем дефисы на пробелы для поиска в объекте collections
  const collectionName = name.toLowerCase().replace(/-/g, ' ');
  return collections[collectionName] ? collectionName : null;
};