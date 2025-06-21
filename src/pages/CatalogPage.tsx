import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../components/Header/Header';
import { Footer } from '../components/Footer/footer';
import PhoneButton from '../components/PhoneButton/phone-button';
import { products, collections, getCollectionIdFromName } from '../data/catalog';
import styles from './CatalogPage.module.scss';

// Регистрируем плагин ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const CatalogPage: React.FC = () => {
  const { collectionId, collectionName } = useParams<{ collectionId?: string; collectionName?: string }>();
  const navigate = useNavigate();

  // Определяем текущую коллекцию
  const currentCollectionId = collectionName ? getCollectionIdFromName(collectionName) : collectionId;
  
  // Фильтруем товары по коллекции, если указана
  const filteredProducts = currentCollectionId 
    ? products.filter(product => product.collection === currentCollectionId)
    : products;
  
  // Если коллекция не найдена, перенаправляем на страницу коллекций
  useEffect(() => {
    if (collectionName && !currentCollectionId) {
      navigate('/collections');
    } else if (collectionId && !collections[collectionId as keyof typeof collections]) {
      navigate('/collections');
    }
  }, [collectionId, collectionName, currentCollectionId, navigate]);

  const [activeProduct, setActiveProduct] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoPlayRef = useRef<number | null>(null);
  
  // Touch/Swipe состояния
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const nextSlide = () => {
    setActiveProduct((prev) => (prev + 1) % filteredProducts.length);
  };

  const prevSlide = () => {
    setActiveProduct((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
    // Временно останавливаем автопроигрывание, затем возобновляем через 10 секунд
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setActiveProduct(index);
    // Временно останавливаем автопроигрывание, затем возобновляем через 10 секунд
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleNextSlide = () => {
    nextSlide();
    // Временно останавливаем автопроигрывание, затем возобновляем через 10 секунд
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Минимальная дистанция свайпа для срабатывания
  const minSwipeDistance = 50;

  // Обработчики touch-событий
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(false);
    setIsAutoPlaying(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);
    setIsDragging(true);
    
    // Предотвращаем скролл страницы при горизонтальном свайпе
    const deltaX = Math.abs(currentX - touchStart);
    
    if (deltaX > 10) { // Если горизонтальное движение больше 10px
      e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setTouchStart(null);
      setTouchEnd(null);
      setIsDragging(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    
    // Возобновляем автопроигрывание через 10 секунд
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Обработчики mouse-событий для десктопа (drag)
  const onMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth > 1024) return; // Только для планшетов и мобильных
    
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsDragging(false);
    setIsAutoPlaying(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (window.innerWidth > 1024 || touchStart === null) return;
    
    setTouchEnd(e.clientX);
    setIsDragging(true);
  };

  const onMouseUp = () => {
    if (window.innerWidth > 1024) return;
    
    if (!touchStart || !touchEnd) {
      setTouchStart(null);
      setTouchEnd(null);
      setIsDragging(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Сброс активного слайда при смене коллекции
  useEffect(() => {
    setActiveProduct(0);
  }, [currentCollectionId]);

  // Сброс состояния загрузки при смене слайда
  useEffect(() => {
    setImageLoaded(false);
    
    // Предварительная загрузка текущего изображения
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = filteredProducts[activeProduct]?.image;
    
    // Предварительная загрузка следующих изображений для быстрого отображения на планшетах
    if (window.innerWidth <= 1024) {
      filteredProducts.forEach((product, index) => {
        if (index !== activeProduct) {
          const preloadImg = new Image();
          preloadImg.src = product.image;
        }
      });
    }
  }, [filteredProducts, activeProduct]);

  // Автопроигрывание слайдов
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = window.setInterval(() => {
        nextSlide();
      }, 5000);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [isAutoPlaying, filteredProducts.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        handleNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!sectionsRef.current || filteredProducts.length === 0 || !imageLoaded) return;

    const sections = productRefs.current.filter(Boolean);
    
    // Определяем тип устройства для оптимизации анимации
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    const isMobile = window.innerWidth <= 768;
    
    // Более плавная анимация при смене слайда
    const currentSection = sections[activeProduct];
    if (currentSection) {
      const infoContent = currentSection.querySelector(`.${styles.productInfoContent}`);
      
      if (isTablet || isMobile) {
        // Упрощенная быстрая анимация для планшетов и мобильных - запускается сразу после загрузки изображения
        gsap.timeline()
          .set(currentSection, { opacity: 1, scale: 1, y: 0 })
          .set(infoContent, { opacity: 1, y: 0 }); // Убираем анимацию для мгновенного появления
      } else {
        // Полная анимация для десктопа
        gsap.timeline()
          .fromTo(currentSection, 
            { opacity: 0.9, scale: 0.95, y: 0 }, 
            { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: "power3.out" }
          )
          .fromTo(infoContent, 
            { opacity: 0, x: -50 }, 
            { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, 
            "-=0.4"
          );
      }
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [activeProduct, filteredProducts.length, imageLoaded]);

  // Если нет товаров в коллекции
  if (filteredProducts.length === 0 && currentCollectionId) {
    return (
      <div className={styles.catalogPage}>
        <Header />
        <div className={styles.emptyCollection}>
          <h2>Коллекция пуста</h2>
          <p>В данной коллекции пока нет товаров</p>
          <button onClick={() => navigate('/collections')}>
            Вернуться к коллекциям
          </button>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <div className={styles.catalogPage}>
      <div className={styles.catalogContent}>
        <Header />
        <div 
          className={styles.sliderContainer}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => {
            setIsAutoPlaying(true);
            onMouseUp();
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          {/* Навигация стрелками */}
          <button className={styles.sliderArrow + ' ' + styles.sliderArrowLeft} onClick={prevSlide}>
          </button>
          <button className={styles.sliderArrow + ' ' + styles.sliderArrowRight} onClick={handleNextSlide}>
          </button>

          {/* Слайд */}
          <div className={styles.productShowcase} ref={sectionsRef}>
            <div 
              key={filteredProducts[activeProduct].id} 
              ref={(el) => {
                if (el) {
                  productRefs.current[activeProduct] = el;
                }
              }}
              className={styles.productSection}
            >
              <div className={styles.productFullscreenWrapper}>
                <div 
                  className={styles.productBackground} 
                  style={{ backgroundImage: `url(${filteredProducts[activeProduct].image})` }}
                >
                  {/* Индикаторы слайдов внутри фото */}
                  <div className={styles.sliderDots}>
                    {filteredProducts.map((_, index) => (
                      <button
                        key={index}
                        className={`${styles.sliderDot} ${index === activeProduct ? styles.sliderDotActive : ''}`}
                        onClick={() => goToSlide(index)}
                      />
                    ))}
                  </div>
                </div>
                
                <div className={`${styles.productInfoOverlay} ${activeProduct % 2 === 0 ? styles.infoLeft : styles.infoRight}`}>
                  <div className={styles.productInfoContent}>
                    <h2 className={styles.productName}>{filteredProducts[activeProduct].name}</h2>
                    <p className={styles.productPrice}>{filteredProducts[activeProduct].price}</p>
                    
                    <div className={styles.productDetails}>
                      <p className={styles.productDescription}>{filteredProducts[activeProduct].description}</p>
                      
                      <div className={styles.productSpecsTable}>
                        <div className={styles.specsRow}>
                          <div className={styles.specsLabel}>Материал</div>
                          <div className={styles.specsValue}>{filteredProducts[activeProduct].specs.material}</div>
                        </div>
                        <div className={styles.specsRow}>
                          <div className={styles.specsLabel}>Размеры</div>
                          <div className={styles.specsValue}>{filteredProducts[activeProduct].specs.dimensions}</div>
                        </div>
                        <div className={styles.specsRow}>
                          <div className={styles.specsLabel}>Вес</div>
                          <div className={styles.specsValue}>{filteredProducts[activeProduct].specs.weight}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
      <PhoneButton theme="light" />
    </div>
  );
};

export default CatalogPage; 