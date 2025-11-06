import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CollectionsPage.module.scss';
import { collectionCategories } from '../data/catalog';
import tumbyIcon from '../assets/tumby_icon.png';
import komodyIcon from '../assets/komody_icon.png';
import stolyIcon from '../assets/stoly_icon.png';
import stulyaIcon from '../assets/stulya_icon.png';
import konsoliIcon from '../assets/konsoli_icon.png';
import vitrinyIcon from '../assets/vitriny_icon.png';
import allIcon from '../assets/all_icon.png';

// Данные о коллекциях
const collections = [
  {
    id: 'modern-minimalism',
    name: 'Bryce',
    russianName: 'Естественность и элегантность',
    description: 'Коллекция Bryce с фрезерованными фасадами стала одним из самых модных трендов этого года, который будет сохраняться еще долгое время. Изделия выглядят очень естественно, элегантно и подходят под любой современный стиль.',
    image: '/images/Коллекции/01.webp'
  },
  {
    id: 'french-classics',
    name: 'Soho',
    russianName: 'Европейский контемпорари',
    description: 'Изделия коллекции SOHO отлично впишутся в любой интерьер, так как используемый стиль контемпорари объединяет европейскую элегантность и скандинавскую ясность форм.',
    image: '/images/Коллекции/02.webp'
  },
  {
    id: 'comfort-relax',
    name: 'Art Deco',
    russianName: 'Экзотический модерн',
    description: 'Стиль, возникший в Европе и США в начале XX века, объединяющий элементы модерна, классики и экзотики. Он славится: геометрическими формами, богатыми декоративными деталями, использованием дорогих материалов, элегантностью и симметрией.',
    image: '/images/Коллекции/03.webp'
  },
  {
    id: 'industrial-loft',
    name: 'Sydney',
    russianName: 'Графитовый лофт',
    description: 'Коллекция Sydney выполнена из натурального массива дуба. Изделия отличаются интересным сочетанием латунной фурнитуры с темно-графитовым цветом основания, что создает благородный и при этом современный стильный дизайн.',
    image: '/images/Коллекции/04.webp'
  },
  {
    id: 'scandinavian-hygge',
    name: 'Gven',
    russianName: 'Минимализм и долговечность',
    description: 'Стиль минимализм и натуральное дерево идеально гармонируют в Коллекции Gven. Использование МДФ и шпона дуба обеспечивает долговечность и эстетическую привлекательность, а ножки из массива дуба добавляют прочности и стабильности.',
    image: '/images/Коллекции/05.webp'
  }
];

// Helper function to get category icons
const getCategoryIcon = (categoryId: string): string => {
  // Иконки из файлов
  const imageIcons: { [key: string]: string } = {
    'tumby': tumbyIcon,
    'komody': komodyIcon,
    'stoly': stolyIcon,
    'stulya': stulyaIcon,
    'taburety-i-stulya': stulyaIcon, // Для категории табуреты и стулья используем иконку стульев
    'konsoli': konsoliIcon,
    'vitriny': vitrinyIcon,
    'all': allIcon
  };
  
  if (imageIcons[categoryId]) {
    return imageIcons[categoryId];
  }
  
  // Эмодзи иконки для остальных категорий
  const emojiIcons: { [key: string]: string } = {
    'kitchens': '🍳',
    'wardrobes': '👔',
    'living-rooms': '🛋️',
    'bedrooms': '🛏️',
    'hallways': '🚪',
    'childrens-rooms': '🧸',
    'bathrooms': '🛁',
    'offices': '💼',
    'dining-rooms': '🍽️',
    'storage': '📦',
    'accessories': '✨'
  };
  return emojiIcons[categoryId] || '🏠';
};

const CollectionsPage: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState(collections[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCollectionsMenu, setShowCollectionsMenu] = useState(true);
  const navigate = useNavigate();

  // Проверка на мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Анимация появления контента
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Автоматический слайдер для мобильных устройств
  useEffect(() => {
    // Остановить автопереключение если не мобильное устройство или открыто меню категорий
    if (!isMobile || showCategoryPicker) return;

    const interval = setInterval(() => {
      setSelectedCollection(current => {
        const currentIndex = collections.findIndex(col => col.id === current.id);
        const nextIndex = (currentIndex + 1) % collections.length;
        return collections[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isMobile, showCategoryPicker]);

  const handleCollectionSelect = (collection: typeof collections[0]) => {
    setSelectedCollection(collection);
    setSelectedCategory('');
    // This function only changes the preview - no animation triggered
  };

  const handleCollectionClick = (collection: typeof collections[0]) => {
    setSelectedCollection(collection);
    setSelectedCategory('');
    
    // Trigger animation: hide collections menu and show category picker
    setShowCollectionsMenu(false);
    setTimeout(() => {
      setShowCategoryPicker(true);
    }, 300); // Wait for fade out animation to complete
  };

  const handleGoToCollection = (collection: typeof collections[0], category?: string) => {
    // Преобразуем название коллекции в URL-friendly формат
    const collectionName = collection.name.toLowerCase().replace(/\s+/g, '-');
    // Используем переданную категорию или текущую выбранную
    const categoryToUse = category !== undefined ? category : selectedCategory;
    // Добавляем категорию в URL, если выбрана не "все"
    const categoryParam = categoryToUse && categoryToUse !== 'all' ? `?category=${categoryToUse}` : '';
    console.log('Navigating to:', `/collections/${collectionName}${categoryParam}`, 'Collection:', collection.name, 'Category:', categoryToUse);
    navigate(`/collections/${collectionName}${categoryParam}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    console.log('Category changed to:', categoryId, 'Current collection:', selectedCollection.name);
    setSelectedCategory(categoryId);
    
    // Navigate to catalog with selected category after a short delay for visual feedback
    setTimeout(() => {
      handleGoToCollection(selectedCollection, categoryId);
    }, 200);
  };

  const handleBackToCollections = () => {
    // Trigger animation: hide category picker and show collections menu
    setShowCategoryPicker(false);
    setTimeout(() => {
      setShowCollectionsMenu(true);
    }, 300); // Wait for fade out animation to complete
  };

  return (
    <div className={`${styles.collectionsPage} ${isLoaded ? styles.loaded : ''}`}>
      <div className={styles.collectionsContainer}>
        {/* Превью коллекции слева */}
        <div className={`${styles.collectionPreview} ${styles.fadeInLeft}`}>
          <div 
            className={styles.previewBackground}
            style={{ backgroundImage: `url(${selectedCollection.image})` }}
          >
            <div className={styles.previewOverlay}>
              <div className={styles.previewContent}>
                <div className={styles.magazineLayout}>
                  <div className={`${styles.collectionNumber} ${styles.fadeInUp}`}>
                    {String(collections.findIndex(c => c.id === selectedCollection.id) + 1).padStart(2, '0')}
                  </div>
                  <div className={styles.collectionInfo}>
                    <h2 className={`${styles.previewTitle} ${styles.fadeInUp}`} style={{ animationDelay: '0.2s' }}>
                      <span className={styles.titleMain}>{selectedCollection.name}</span>
                      <span className={styles.titleSub}>{selectedCollection.russianName}</span>
                    </h2>
                    <div className={`${styles.descriptionWrapper} ${styles.fadeInUp}`} style={{ animationDelay: '0.4s' }}>
                      <p className={styles.previewDescription}>{selectedCollection.description}</p>
                      <div className={styles.collectionMeta}>
                        <span className={styles.collectionYear}>2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Меню коллекций справа */}
        <div className={`${styles.collectionsMenu} ${styles.fadeInRight}`}>
          {/* Заголовок с названием коллекции */}
          <div className={`${styles.menuHeader} ${styles.fadeInUp}`} style={{ animationDelay: '0.1s' }}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h1 className={styles.menuTitle}>
                  {showCategoryPicker ? `${selectedCollection.name}` : 'Коллекции'}
                </h1>
                <p className={styles.menuSubtitle}>
                  {showCategoryPicker ? 'Выберите категорию для просмотра' : 'Выберите коллекцию для просмотра'}
                </p>
              </div>
              {showCategoryPicker && (
                <button
                  className={`${styles.categoryButton} ${styles.backButton}`}
                  onClick={handleBackToCollections}
                >
                  ← Назад к коллекциям
                </button>
              )}
            </div>
          </div>
          
          {/* Меню коллекций (анимированное появление/исчезновение) */}
          {showCollectionsMenu && (
            <div className={`${styles.collectionsList} ${styles.fadeIn}`}>
              <nav className={styles.menuNav}>
                {collections.map((collection, index) => (
                  <button
                    key={collection.id}
                    className={`${styles.menuItem} ${styles.fadeInUp} ${selectedCollection.id === collection.id ? styles.menuItemActive : ''}`}
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    onClick={() => handleCollectionClick(collection)}
                    onMouseEnter={() => handleCollectionSelect(collection)}
                  >
                    <div className={styles.menuItemContent}>
                      <h3 className={styles.menuItemTitle}>{collection.name}</h3>
                    </div>
                    <div className={styles.menuItemArrow}>→</div>
                  </button>
                ))}
              </nav>
            </div>
          )}
          
          {/* Выбор категории (анимированное появление/исчезновение) */}
          {showCategoryPicker && (
            <div className={`${styles.categorySelector} ${styles.fadeIn}`}>
              <div className={styles.categoryGrid}>
                <button
                  className={`${styles.categoryCard} ${selectedCategory === 'all' ? styles.categoryCardActive : ''}`}
                  onClick={() => handleCategoryChange('all')}
                >
                  <div className={styles.categoryIcon}>
                    <img src={getCategoryIcon('all')} alt="Все категории" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                  </div>
                  <div>Все категории</div>
                </button>
                {selectedCollection && collectionCategories[selectedCollection.name.toLowerCase()] && (
                  collectionCategories[selectedCollection.name.toLowerCase()].map((category) => (
                    <button
                      key={category.id}
                      className={`${styles.categoryCard} ${selectedCategory === category.id ? styles.categoryCardActive : ''}`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      <div className={styles.categoryIcon}>
                        {['tumby', 'komody', 'stoly', 'stulya', 'taburety-i-stulya', 'konsoli', 'vitriny'].includes(category.id) ? (
                          <img src={getCategoryIcon(category.id)} alt={category.nameRu} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                        ) : (
                          getCategoryIcon(category.id)
                        )}
                      </div>
                      <div>{category.nameRu}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionsPage;