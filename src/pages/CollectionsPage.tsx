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
import krovatiIcon from '../assets/krovati_icon.png';
import zerkalaIcon from '../assets/zerkala_icon.png';
import taburetyIcon from '../assets/taburety_icon.png';
import banketkiIcon from '../assets/banketki_icon.png';
import stelazhiIcon from '../assets/stelazhi_icon.png';
import { Link } from 'react-router-dom';

// Данные о коллекциях
const collections = [
  {
    id: 'modern-minimalism',
    name: 'Bryce',
    russianName: 'Естественность и элегантность',
    description: 'Коллекция Bryce с фрезерованными фасадами стала одним из самых модных трендов этого года, который будет сохраняться еще долгое время. Изделия выглядят очень естественно, элегантно и подходят под любой современный стиль.',
    image: '/images/Коллекции/bryce.png'
  },
  {
    id: 'french-classics',
    name: 'Soho',
    russianName: 'Европейский контемпорари',
    description: 'Изделия коллекции SOHO отлично впишутся в любой интерьер, так как используемый стиль контемпорари объединяет европейскую элегантность и скандинавскую ясность форм.',
    image: '/images/Коллекции/soho.png'
  },
  {
    id: 'comfort-relax',
    name: 'Art Deco',
    russianName: 'Экзотический модерн',
    description: 'Стиль, возникший в Европе и США в начале XX века, объединяющий элементы модерна, классики и экзотики. Он славится: геометрическими формами, богатыми декоративными деталями, использованием дорогих материалов, элегантностью и симметрией.',
    image: '/images/Коллекции/artdeco.png'
  },
  {
    id: 'industrial-loft',
    name: 'Sydney',
    russianName: 'Графитовый лофт',
    description: 'Коллекция Sydney выполнена из натурального массива дуба. Изделия отличаются интересным сочетанием латунной фурнитуры с темно-графитовым цветом основания, что создает благородный и при этом современный стильный дизайн.',
    image: '/images/Коллекции/sydney.png'
  },
  {
    id: 'scandinavian-hygge',
    name: 'Gven',
    russianName: 'Минимализм и долговечность',
    description: 'Стиль минимализм и натуральное дерево идеально гармонируют в Коллекции Gven. Использование МДФ и шпона дуба обеспечивает долговечность и эстетическую привлекательность, а ножки из массива дуба добавляют прочности и стабильности.',
    image: '/images/Коллекции/gven.png'
  },
  {
    id: 'dining-groups',
    name: 'Dining Groups',
    russianName: 'Столовые группы',
    description: 'Элегантные столы и стулья для создания уютной столовой зоны. Идеальное сочетание комфорта и стиля для семейных обедов и встреч с друзьями.',
    image: '/images/Коллекции/dining-groups.png'
  }
];

// Helper function to get category icons
const getCategoryIcon = (categoryId: string): any => {
  // Иконки из файлов
  const imageIcons: { [key: string]: string } = {
    'tumby': tumbyIcon,
    'komody': komodyIcon,
    'stoly': stolyIcon,
    'stulya': stulyaIcon,
    'taburety-i-stulya': taburetyIcon,
    'konsoli': konsoliIcon,
    'vitriny': vitrinyIcon,
    'all': allIcon,
    'krovati': krovatiIcon,
    'zerkala': zerkalaIcon,
    'taburety': taburetyIcon,
    'banketki': banketkiIcon,
    'stelazhi': stelazhiIcon
  };
  
  if (imageIcons[categoryId]) {
    return imageIcons[categoryId];
  }
};

const CollectionsPage: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState(collections[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCollectionsMenu, setShowCollectionsMenu] = useState(true);
  const [showAllCollections, setShowAllCollections] = useState(false);
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
useEffect(() => {
  if (!isMobile || showCategoryPicker) return;

  const interval = setInterval(() => {
    setSelectedCollection(current => {
      const availableCollections = showAllCollections ? collections : collections.slice(0, 4);
      const currentIndex = availableCollections.findIndex(col => col.id === current.id);
      const nextIndex = (currentIndex + 1) % availableCollections.length;
      return availableCollections[nextIndex];
    });
  }, 3000);

  return () => clearInterval(interval);
}, [isMobile, showCategoryPicker, showAllCollections]); 


  const handleCollectionSelect = (collection: typeof collections[0]) => {
    setSelectedCollection(collection);
    setSelectedCategory('');
  };

  const handleCollectionClick = (collection: typeof collections[0]) => {
    setSelectedCollection(collection);
    setSelectedCategory('');
    

    setShowCollectionsMenu(false);
    setTimeout(() => {
      setShowCategoryPicker(true);
    }, 300); 
  };

  const handleGoToCollection = (collection: typeof collections[0], category?: string) => {
    
    const collectionName = collection.name.toLowerCase().replace(/\s+/g, '-');
    
    const categoryToUse = category !== undefined ? category : selectedCategory;
    
    const categoryParam = categoryToUse && categoryToUse !== 'all' ? `?category=${categoryToUse}` : '';
    console.log('Navigating to:', `/collections/${collectionName}${categoryParam}`, 'Collection:', collection.name, 'Category:', categoryToUse);
    navigate(`/collections/${collectionName}${categoryParam}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    console.log('Category changed to:', categoryId, 'Current collection:', selectedCollection.name);
    setSelectedCategory(categoryId);
    
    setTimeout(() => {
      handleGoToCollection(selectedCollection, categoryId);
    }, 200);
  };

  const handleBackToCollections = () => {
    setShowCategoryPicker(false);
    setTimeout(() => {
      setShowCollectionsMenu(true);
    }, 300); 
  };

  const handleShowAllCollections = () => {
    setShowAllCollections(!showAllCollections);
  };

  // Получаем коллекции для отображения
  const visibleCollections = isMobile && !showAllCollections 
    ? collections.slice(0, 4) 
    : showAllCollections 
    ? collections 
    : collections.slice(0, 4);

  return (
    <div className={`${styles.collectionsPage} ${isLoaded ? styles.loaded : ''}`}>
      <div className={styles.collectionsContainer}>
        <div className={`${styles.collectionPreview} ${styles.fadeInLeft}`}>
          <div 
            className={styles.previewBackground}
            style={{ backgroundImage: `url(${selectedCollection.image})` }}
          >
            
            <div className={styles.previewOverlay}>
                <header className={styles.collectionsHeader}>
                    <Link to='/'>
                      <img src='/SVOBODA_LOGO_WHITE.png' alt="" className={styles.headerLogo} />
                    </Link>
                </header>
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
              {showCategoryPicker ? (
                <button
                  className={`${styles.categoryButton} ${styles.backButton}`}
                  onClick={handleBackToCollections}
                >
                  ← Назад к коллекциям
                </button>
              ) : (
                <button
                  className={`${styles.categoryButton} ${styles.backButton}`}
                  onClick={() => navigate('/')}
                >
                  ← На главную
                </button>
              )}
            </div>
          </div>
          {showCollectionsMenu && (
            <div className={`${styles.collectionsList} ${styles.fadeIn}`}>
              <nav className={styles.menuNav}>
                {visibleCollections.map((collection, index) => (
                  <button
                    key={collection.id}
                    className={`${styles.menuItem} ${styles.fadeInUp} ${selectedCollection.id === collection.id ? styles.menuItemActive : ''}`}
                    style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                    onClick={() => handleCollectionClick(collection)}
                    onMouseEnter={() => !isMobile && handleCollectionSelect(collection)}
                  >
                    <div className={styles.menuItemContent}>
                      <h3 className={styles.menuItemTitle}>{collection.name}</h3>
                    </div>
                    <div className={styles.menuItemArrow}>→</div>
                  </button>
                ))}
              </nav>
              
              {collections.length > (isMobile ? 3 : 4) && (
                <button 
                  className={`${styles.showAllButton} ${styles.fadeInUp}`}
                  style={{ animationDelay: '0.3s' }}
                  onClick={handleShowAllCollections}
                >
                  {showAllCollections ? 'Скрыть' : 'Показать все коллекции'}
                  <span className={`${styles.showAllArrow} ${showAllCollections ? styles.rotated : ''}`}>↓</span>
                </button>
              )}
            </div>
          )}
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
                {selectedCollection && collectionCategories[selectedCollection.name.toLowerCase().replace(/\s+/g, '-')] && (
                  collectionCategories[selectedCollection.name.toLowerCase().replace(/\s+/g, '-')].map((category) => (
                    <button
                      key={category.id}
                      className={`${styles.categoryCard} ${selectedCategory === category.id ? styles.categoryCardActive : ''}`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      <div className={styles.categoryIcon}>
                        {['tumby', 'komody', 'stoly', 'stulya', 'taburety-i-stulya', 'konsoli', 'vitriny', 'krovati', 'zerkala', 'taburety', 'banketki', 'stelazhi'].includes(category.id) ? (
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