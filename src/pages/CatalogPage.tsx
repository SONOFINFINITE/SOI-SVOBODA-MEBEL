import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../components/Header/Header';
import { Footer } from '../components/Footer/footer';
import PhoneButton from '../components/PhoneButton/phone-button';
import ModalGallery from '../components/ModalGallery/ModalGallery';
import { products, collections, getCollectionIdFromName, getProductImages } from '../data/catalog';
import styles from './CatalogPage.module.scss';
// Регистрируем плагин ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
const CatalogPage: React.FC = () => {
const { collectionId, collectionName } = useParams<{ collectionId?: string; collectionName?: string }>();
const navigate = useNavigate();
// Определяем текущую коллекцию
const currentCollectionId = collectionName ? getCollectionIdFromName(collectionName) : collectionId;
// Фильтруем товары по коллекции, если указана - используем useMemo для предотвращения пересоздания массива
const filteredProducts = useMemo(() => {
  return currentCollectionId
    ? products.filter(product => product.collection === currentCollectionId)
    : products;
}, [currentCollectionId]);
// Если коллекция не найдена, перенаправляем на страницу коллекций
useEffect(() => {
if (collectionName && !currentCollectionId) {
navigate('/collections');
} else if (collectionId && !collections[collectionId as keyof typeof collections]) {
navigate('/collections');
}
}, [collectionId, collectionName, currentCollectionId, navigate]);
const [activeProduct, setActiveProduct] = useState(0);
const sectionsRef = useRef<HTMLDivElement>(null);
const productRefs = useRef<(HTMLDivElement | null)[]>([]);
const autoPlayRef = useRef<number | null>(null);
const lastInteractionRef = useRef<number>(Date.now());
// Состояние для модальной галереи
const [isGalleryOpen, setIsGalleryOpen] = useState(false);
const [galleryActiveImage, setGalleryActiveImage] = useState(0);
// Touch/Swipe состояния
const [touchStart, setTouchStart] = useState<number | null>(null);
const [touchEnd, setTouchEnd] = useState<number | null>(null);
const [, setIsDragging] = useState(false);
const [touchStartedInInfo, setTouchStartedInInfo] = useState(false);
const [imageLoaded, setImageLoaded] = useState(false);
// Мемоизируем список изображений для текущего товара, чтобы избежать лишних пересчетов при рендере
const currentProductImages = useMemo(() => {
if (!filteredProducts[activeProduct]) return [];
return getProductImages(filteredProducts[activeProduct]);
}, [activeProduct, filteredProducts]);
const nextSlide = () => {
setActiveProduct((prev) => (prev + 1) % filteredProducts.length);
lastInteractionRef.current = Date.now();
};
const prevSlide = () => {
setActiveProduct((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
lastInteractionRef.current = Date.now();
};
const goToSlide = (index: number) => {
setActiveProduct(index);
lastInteractionRef.current = Date.now();
};
const handleNextSlide = () => {
nextSlide();
lastInteractionRef.current = Date.now();
};
// Минимальная дистанция свайпа для срабатывания
const minSwipeDistance = 50;
// Обработчики touch-событий
const onTouchStart = (e: React.TouchEvent) => {
// Проверяем, началось ли касание в области описания товара
const target = e.target as HTMLElement;
const isInProductInfo = target.closest(`.${styles.productInfoContent}`);
setTouchStartedInInfo(!!isInProductInfo);

setTouchEnd(null);
setTouchStart(e.targetTouches[0].clientX);
setIsDragging(false);
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
setTouchStartedInInfo(false);
return;
}

// Не переключаем слайды, если касание началось в области описания
if (!touchStartedInInfo) {
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > minSwipeDistance;
  const isRightSwipe = distance < -minSwipeDistance;

  if (isLeftSwipe) {
    handleNextSlide();
  } else if (isRightSwipe) {
    prevSlide();
  }
}

setTouchStart(null);
setTouchEnd(null);
setIsDragging(false);
setTouchStartedInInfo(false);

};
// Обработчики mouse-событий для десктопа (drag)
const onMouseDown = (e: React.MouseEvent) => {
if (window.innerWidth > 1024) return; // Только для планшетов и мобильных

setTouchEnd(null);
setTouchStart(e.clientX);
setIsDragging(false);

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

};
// Сброс активного слайда при смене коллекции
useEffect(() => {
setActiveProduct(0);
}, [currentCollectionId]);
// Сброс состояния загрузки при смене слайда
useEffect(() => {
if (!filteredProducts[activeProduct]) return;

setImageLoaded(false);

// Предварительная загрузка текущего изображения
const img = new Image();
img.onload = () => setImageLoaded(true);
img.src = filteredProducts[activeProduct].image;

// Предварительная загрузка следующих изображений для быстрого отображения на планшетах
if (window.innerWidth <= 1024) {
  filteredProducts.forEach((product, index) => {
    if (index !== activeProduct) {
      const preloadImg = new Image();
      preloadImg.src = product.image;
    }
  });
}

}, [activeProduct]); // Убираем filteredProducts из зависимостей, т.к. он теперь мемоизирован
// Автопроигрывание слайдов каждые 8 секунд
useEffect(() => {
// Приостанавливаем автопроигрывание, если открыта галерея или товаров меньше 2
if (isGalleryOpen || filteredProducts.length <= 1) {
if (autoPlayRef.current) {
clearInterval(autoPlayRef.current);
autoPlayRef.current = null;
}
return;
}
// Очищаем предыдущий таймер, если он есть
if (autoPlayRef.current) {
  clearInterval(autoPlayRef.current);
}

// Устанавливаем новый таймер
autoPlayRef.current = window.setInterval(() => {
  const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
  // Если прошло 8 секунд с последнего взаимодействия, переключаем слайд
  if (timeSinceLastInteraction >= 8000) {
    setActiveProduct((prev) => {
      const next = (prev + 1) % filteredProducts.length;
      lastInteractionRef.current = Date.now();
      return next;
    });
  }
}, 1000); // Проверяем каждую секунду

return () => {
  if (autoPlayRef.current) {
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = null;
  }
};

}, [filteredProducts.length, isGalleryOpen]); // Добавляем isGalleryOpen в зависимости

// ДОБАВЛЕНО: Эффект для блокировки скролла страницы при открытой галерее
useEffect(() => {
  if (isGalleryOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }

  // Функция очистки: возвращаем скролл, если компонент размонтируется
  return () => {
    document.body.style.overflow = 'auto';
  };
}, [isGalleryOpen]);


// Анимации
useEffect(() => {
// Проверяем условия для запуска анимации
if (isGalleryOpen || !sectionsRef.current || filteredProducts.length === 0 || !imageLoaded) return;

const sections = productRefs.current.filter(Boolean);
const currentSection = sections[activeProduct];

if (currentSection) {
  const infoContent = currentSection.querySelector(`.${styles.productInfoContent}`);
  
  // Единая плавная анимация для всех устройств
  gsap.timeline()
    .fromTo(currentSection, 
      { opacity: 0.9, scale: 0.95, y: 0 }, 
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out" }
    )
    .fromTo(infoContent, 
      { opacity: 0, x: -50 }, 
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.4"
    );
}

return () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};
}, [activeProduct, imageLoaded]); // Оптимизируем зависимости
// Обработчик клика по фону (открывает галерею)
const handleBackgroundClick = (e: React.MouseEvent) => {
// Останавливаем всплытие события и предотвращаем действия по умолчанию
e.stopPropagation();
e.preventDefault();
// Открываем галерею при клике на фон
setIsGalleryOpen(true);
setGalleryActiveImage(0); // Начинаем с первого изображения
};
// Закрытие галереи
const closeGallery = useCallback(() => {
  setIsGalleryOpen(false);
  lastInteractionRef.current = Date.now();
}, []);

// Навигация по галерее
const nextGalleryImage = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  if (currentProductImages.length === 0) return;
  setGalleryActiveImage((prev) => (prev + 1) % currentProductImages.length);
}, [currentProductImages.length]);

const prevGalleryImage = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  if (currentProductImages.length === 0) return;
  setGalleryActiveImage((prev) => (prev - 1 + currentProductImages.length) % currentProductImages.length);
}, [currentProductImages.length]);

const handleGalleryImageChange = useCallback((index: number) => {
  setGalleryActiveImage(index);
}, []);
// Обработчик клавиш для галереи и слайдера
useEffect(() => {
const handleKeyDown = (event: KeyboardEvent) => {
if (isGalleryOpen) {
if (event.key === 'ArrowLeft') {
event.preventDefault();
prevGalleryImage();
} else if (event.key === 'ArrowRight') {
event.preventDefault();
nextGalleryImage();
} else if (event.key === 'Escape') {
closeGallery();
}
} else {
if (event.key === 'ArrowLeft') {
event.preventDefault();
prevSlide();
} else if (event.key === 'ArrowRight') {
event.preventDefault();
handleNextSlide();
}
}
};

window.addEventListener('keydown', handleKeyDown);
return () => window.removeEventListener('keydown', handleKeyDown);
}, [isGalleryOpen, activeProduct, filteredProducts.length]);
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
// Если товары еще загружаются или массив пуст (начальное состояние)
if (filteredProducts.length === 0) {
return (
<div className={styles.loaderContainer}>
<div className={styles.loader}>
<div className={styles.loaderText}>SVOBODA</div>
<div className={styles.loaderBar}></div>
</div>
</div>
);
}
return (
<div className={styles.catalogPage}>
<div className={styles.catalogContent}>
<Header />
<div
className={styles.sliderContainer}
onMouseEnter={() => {}}
onMouseLeave={() => {
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
<button className={styles.sliderArrow + ' ' + styles.sliderArrowLeft} onClick={(e) => {
e.stopPropagation();
prevSlide();
}}>
</button>
<button className={styles.sliderArrow + ' ' + styles.sliderArrowRight} onClick={(e) => {
e.stopPropagation();
handleNextSlide();
}}>
</button>
{/* Слайд */}
      <div className={styles.productShowcase} ref={sectionsRef}>
        <div 
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
              onClick={handleBackgroundClick}
              role="button"
              tabIndex={0}
              aria-label="Открыть галерею изображений"
            >
              {/* Контейнер-якорь для точек */}
              <div className={styles.dotsAnchor}>
                {/* Точки для переключения слайдов */}
                {!isGalleryOpen && filteredProducts.length > 1 && (
                  <div className={styles.sliderDots}>
                      {filteredProducts.map((_, index) => (
                      <button
                          key={index}
                          className={`${styles.sliderDot} ${index === activeProduct ? styles.sliderDotActive : ''}`}
                          onClick={(e) => {
                            e.stopPropagation(); // Важно, чтобы клик не открывал галерею
                            e.preventDefault();
                            goToSlide(index);
                          }}
                          aria-label={`Перейти к слайду ${index + 1}`}
                      />
                      ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className={`${styles.productInfoOverlay} ${activeProduct % 2 === 0 ? styles.infoLeft : styles.infoRight}`}>
              <div className={styles.productInfoContent} onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
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
  
  {/* Модальная галерея */}
  <ModalGallery
    isOpen={isGalleryOpen}
    onClose={closeGallery}
    images={currentProductImages}
    onNext={nextGalleryImage}
    onPrev={prevGalleryImage}
    onImageChange={handleGalleryImageChange}
    currentImageIndex={galleryActiveImage}
  />
  
  <Footer />
  <PhoneButton theme="light" />
</div>
);
};
export default CatalogPage;
