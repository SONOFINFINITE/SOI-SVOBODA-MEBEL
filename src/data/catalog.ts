// Типы данных для каталога
export interface ProductSpecs {
  material: string;
  dimensions: string;
  weight: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  collection: string;
  specs: ProductSpecs;
}

export interface Collection {
  name: string;
  russianName: string;
  description: string;
}

export interface Collections {
  [key: string]: Collection;
}

// Данные о товарах с привязкой к коллекциям
export const products: Product[] = [
  {
    id: 1,
    name: 'Hugo',
    description: 'Современная лавка с элегантным дизайном и удобной посадкой. Идеально подходит для прихожей или веранды.',
    price: '45 000 ₽',
    image: '/images/Каталог/Hugo-2.webp',
    collection: 'milano',
    specs: {
      material: 'Натуральное дерево, металл',
      dimensions: '120 × 45 × 45 см',
      weight: '25 кг'
    }
  },
  {
    id: 2,
    name: 'Moulin',
    description: 'Стильный барный стул из натурального дерева и металла. Минималистичный дизайн без спинки.',
    price: '12 000 ₽',
    image: '/images/Каталог/Moulin-3.webp',
    collection: 'berlin',
    specs: {
      material: 'Натуральное дерево, металл',
      dimensions: '45 × 45 × 75 см',
      weight: '8 кг'
    }
  },
  {
    id: 3,
    name: 'Bocuse',
    description: 'Элегантный обеденный стол из натурального дерева с минималистичным дизайном. Идеально подходит для кухни или столовой.',
    price: '38 000 ₽',
    image: '/images/Каталог/Bocuse-2.webp',
    collection: 'milano',
    specs: {
      material: 'Натуральное дерево',
      dimensions: '160 × 90 × 75 см',
      weight: '45 кг'
    }
  },
  {
    id: 4,
    name: 'Gauguin Fauteuil',
    description: 'Кресло-реклайнер с регулируемой спинкой и подставкой для ног, обеспечивающее максимальный комфорт.',
    price: '52 000 ₽',
    image: '/images/Каталог/Gauguin-Fauteuil-2.webp',
    collection: 'toscana',
    specs: {
      material: 'Дерево, кожа',
      dimensions: '90 × 100 × 105 см',
      weight: '20 кг'
    }
  },
  {
    id: 5,
    name: 'Camus TAM',
    description: 'Практичный дачный столик с прочной столешницей и устойчивой конструкцией. Идеально подходит для использования на открытом воздухе.',
    price: '42 000 ₽',
    image: '/images/Каталог/Camus-TAM-2.webp',
    collection: 'stockholm',
    specs: {
      material: 'Дуб, лён',
      dimensions: '120 × 60 × 75 см',
      weight: '25 кг'
    }
  },
  {
    id: 6,
    name: 'Bonaparte',
    description: 'Уютный диван в стиле прованс с мягкими подушками и деревянными элементами декора. Идеально подходит для создания атмосферы французского загородного дома.',
    price: '85 000 ₽',
    image: '/images/Каталог/Bonaparte-1.webp',
    collection: 'provence',
    specs: {
      material: 'Массив сосны, хлопок, лён',
      dimensions: '220 × 95 × 85 см',
      weight: '45 кг'
    }
  },
  {
    id: 7,
    name: 'Versailles',
    description: 'Изысканное кресло в классическом французском стиле с мягкой обивкой и деревянными подлокотниками.',
    price: '65 000 ₽',
    image: '/images/Каталог/Gauguin-Fauteuil-2.webp',
    collection: 'provence',
    specs: {
      material: 'Дерево, велюр',
      dimensions: '80 × 85 × 90 см',
      weight: '18 кг'
    }
  },
  {
    id: 8,
    name: 'Loire',
    description: 'Элегантная консоль в стиле прованс с изящными резными деталями и патинированной отделкой.',
    price: '48 000 ₽',
    image: '/images/Каталог/Hugo-2.webp',
    collection: 'provence',
    specs: {
      material: 'Массив дуба',
      dimensions: '140 × 40 × 85 см',
      weight: '22 кг'
    }
  },
  {
    id: 9,
    name: 'Industrial Forge',
    description: 'Массивный стол в индустриальном стиле с металлическим каркасом и деревянной столешницей.',
    price: '58 000 ₽',
    image: '/images/Каталог/Bocuse-2.webp',
    collection: 'berlin',
    specs: {
      material: 'Металл, дерево',
      dimensions: '180 × 90 × 75 см',
      weight: '55 кг'
    }
  },
  {
    id: 10,
    name: 'Berlin Loft',
    description: 'Стильное кресло в индустриальном стиле с кожаной обивкой и металлическим каркасом.',
    price: '45 000 ₽',
    image: '/images/Каталог/Gauguin-Fauteuil-2.webp',
    collection: 'berlin',
    specs: {
      material: 'Металл, кожа',
      dimensions: '85 × 90 × 95 см',
      weight: '28 кг'
    }
  },
  {
    id: 11,
    name: 'Nordic Light',
    description: 'Светлый комод в скандинавском стиле с минималистичным дизайном и функциональными ящиками.',
    price: '35 000 ₽',
    image: '/images/Каталог/Bonaparte-1.webp',
    collection: 'stockholm',
    specs: {
      material: 'Светлое дерево',
      dimensions: '120 × 45 × 85 см',
      weight: '30 кг'
    }
  },
  {
    id: 12,
    name: 'Stockholm Cozy',
    description: 'Уютное кресло-качалка в скандинавском стиле с мягкой обивкой и деревянным каркасом.',
    price: '52 000 ₽',
    image: '/images/Каталог/Hugo-2.webp',
    collection: 'stockholm',
    specs: {
      material: 'Дерево, текстиль',
      dimensions: '75 × 85 × 100 см',
      weight: '22 кг'
    }
  },
  {
    id: 13,
    name: 'Comfort Plus',
    description: 'Эргономичный диван для максимального комфорта с регулируемыми подголовниками.',
    price: '75 000 ₽',
    image: '/images/Каталог/Bonaparte-1.webp',
    collection: 'toscana',
    specs: {
      material: 'Дерево, велюр',
      dimensions: '200 × 95 × 90 см',
      weight: '50 кг'
    }
  },
  {
    id: 14,
    name: 'Relax Zone',
    description: 'Мягкое кресло-мешок премиум-класса для идеального расслабления.',
    price: '28 000 ₽',
    image: '/images/Каталог/Camus-TAM-2.webp',
    collection: 'toscana',
    specs: {
      material: 'Эко-кожа, наполнитель',
      dimensions: '80 × 80 × 90 см',
      weight: '12 кг'
    }
  }
];

// Данные о коллекциях
export const collections: Collections = {
  'provence': {
    name: 'Provence',
    russianName: 'Французская классика',
    description: 'Элегантная мебель в стиле французского прованса'
  },
  'milano': {
    name: 'Milano',
    russianName: 'Современный минимализм',
    description: 'Лаконичные формы, функциональность и стиль'
  },
  'toscana': {
    name: 'Toscana',
    russianName: 'Комфорт и релакс',
    description: 'Мебель для отдыха и расслабления'
  },
  'berlin': {
    name: 'Berlin',
    russianName: 'Индустриальный лофт',
    description: 'Брутальная красота промышленной эстетики'
  },
  'stockholm': {
    name: 'Stockholm',
    russianName: 'Скандинавский хюгге',
    description: 'Философия северного уюта, воплощённая в мебели'
  }
};

// Функция для преобразования названия коллекции в ID
export const getCollectionIdFromName = (name: string): string | null => {
  // Теперь ID коллекции соответствует её названию
  const collectionName = name.toLowerCase();
  return collections[collectionName] ? collectionName : null;
}; 