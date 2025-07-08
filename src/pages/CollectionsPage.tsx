import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CollectionsPage.module.scss';

// Данные о коллекциях
const collections = [
  {
    id: 'modern-minimalism',
    name: 'Milano',
    russianName: 'Современный минимализм',
    description: 'Лаконичные формы, функциональность и стиль в каждой детали. Мебель для тех, кто ценит простоту и элегантность в интерьере. Чистые линии, натуральные материалы и продуманная эргономика создают атмосферу спокойствия и гармонии в современном доме.',
    image: '/images/Коллекции/01.webp'
  },
  {
    id: 'french-classics',
    name: 'Provence',
    russianName: 'Французская классика',
    description: 'Элегантная мебель в стиле французского прованса, воплощающая дух старинных усадеб. Натуральные материалы, изысканные формы и неповторимая атмосфера уюта. Каждое изделие хранит тепло ручной работы и традиции мастерства, передаваемые из поколения в поколение.',
    image: '/images/Коллекции/02.webp'
  },
  {
    id: 'comfort-relax',
    name: 'Toscana',
    russianName: 'Комфорт и релакс',
    description: 'Мебель для истинного отдыха и расслабления, созданная для максимального комфорта. Эргономичные решения, мягкие текстуры и продуманная функциональность помогают создать идеальную зону релакса в вашем доме. Место, где время останавливается.',
    image: '/images/Коллекции/03.webp'
  },
  {
    id: 'industrial-loft',
    name: 'Berlin',
    russianName: 'Индустриальный лофт',
    description: 'Брутальная красота промышленной эстетики, адаптированная для современного дома. Металл, дерево и бетон в идеальной гармонии. Мебель для тех, кто не боится экспериментировать и ценит характер в каждой детали интерьера.',
    image: '/images/Коллекции/04.webp'
  },
  {
    id: 'scandinavian-hygge',
    name: 'Stockholm',
    russianName: 'Скандинавский хюгге',
    description: 'Философия северного уюта, воплощённая в мебели. Светлые тона, натуральные текстуры и максимальная функциональность. Создайте атмосферу тепла и спокойствия, где каждый предмет дарит ощущение домашнего комфорта и гармонии с природой.',
    image: '/images/Коллекции/05.webp'
  }
];

const CollectionsPage: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState(collections[0]);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
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
    if (!isMobile) return;

    const interval = setInterval(() => {
      setSelectedCollection(current => {
        const currentIndex = collections.findIndex(col => col.id === current.id);
        const nextIndex = (currentIndex + 1) % collections.length;
        return collections[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isMobile]);

  const handleCollectionSelect = (collection: typeof collections[0]) => {
    setSelectedCollection(collection);
  };

  const handleGoToCollection = (collection: typeof collections[0]) => {
    // Преобразуем название коллекции в URL-friendly формат
    const collectionName = collection.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/collections/${collectionName}`);
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
          <div className={`${styles.menuHeader} ${styles.fadeInUp}`} style={{ animationDelay: '0.1s' }}>
            <h1 className={styles.menuTitle}>Коллекции</h1>
            <p className={styles.menuSubtitle}>Выберите коллекцию для просмотра</p>
          </div>
          
          <nav className={styles.menuNav}>
            {collections.map((collection, index) => (
              <button
                key={collection.id}
                className={`${styles.menuItem} ${styles.fadeInUp} ${selectedCollection.id === collection.id ? styles.menuItemActive : ''}`}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                onClick={() => {
                  handleCollectionSelect(collection);
                  handleGoToCollection(collection);
                }}
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
      </div>
    </div>
  );
};

export default CollectionsPage; 