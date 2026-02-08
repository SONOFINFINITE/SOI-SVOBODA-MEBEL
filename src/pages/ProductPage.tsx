import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../components/Header/Header';
import { Footer } from '../components/Footer/footer';
import PhoneButton from '../components/PhoneButton/phone-button';
import ModalGallery from '../components/ModalGallery/ModalGallery';
import { products, collections, getCollectionIdFromName, getProductImages } from '../data/catalog';
import styles from './ProductPage.module.scss';

gsap.registerPlugin(ScrollTrigger);
const ProductPage: React.FC = () => {
const { collectionId, collectionName, uid } = useParams<{ collectionId?: string; collectionName?: string; uid?: string }>();
const navigate = useNavigate();
const [searchParams] = useSearchParams();


const productFromUid = useMemo(() => uid ? products.find(p => p.uid === uid) : null, [uid]);

const currentCollectionId = useMemo(() => {
  if (collectionName) return getCollectionIdFromName(collectionName);
  if (collectionId) return collectionId;
  if (productFromUid) return productFromUid.collection;
  return null;
}, [collectionName, collectionId, productFromUid]);

const categoryParam = searchParams.get('category');

  const filteredProducts = useMemo(() => {
    let filtered = currentCollectionId
      ? products.filter(product => product.collection === currentCollectionId)
      : products;
    
   
    if (categoryParam && categoryParam !== 'all') {
      filtered = filtered.filter(product => product.category === categoryParam);
    }
    
    return filtered;
  }, [currentCollectionId, categoryParam]);

  // Создаем слайды для отображения
  const slides = useMemo(() => {
    // Режим одного товара (если есть uid)
    if (productFromUid) {
      const images = getProductImages(productFromUid);
      // Если нет изображений, возвращаем хотя бы одно с основной картинкой
      if (images.length === 0) {
        return [{
          product: productFromUid,
          image: productFromUid.image
        }];
      }
      // Возвращаем массив слайдов, где каждый слайд - это одно изображение того же товара
      return images.map(img => ({
        product: productFromUid,
        image: img
      }));
    }

    // Режим коллекции (существующее поведение)
    return filteredProducts.map(p => ({
      product: p,
      image: p.image
    }));
  }, [productFromUid, filteredProducts]);

  // Если коллекция не найдена, перенаправляем на страницу коллекций
  useEffect(() => {
    if (collectionName && !currentCollectionId) {
      navigate('/collections');
    } else if (collectionId && !collections[collectionId as keyof typeof collections]) {
      navigate('/collections');
    }
  }, [collectionId, collectionName, currentCollectionId, navigate]);

  const [activeProduct, setActiveProduct] = useState(0);

  // Установка активного товара при загрузке по UID
  useEffect(() => {
    // В режиме одного товара всегда начинаем с 0 (первое фото)
    if (productFromUid) {
      setActiveProduct(0);
    } else if (filteredProducts.length > 0) {
       // Логика для коллекции (если нужно восстановить позицию или что-то еще)
       // Но пока оставим 0
       // setActiveProduct(0); 
    }
  }, [productFromUid, filteredProducts]); // filteredProducts может измениться при смене фильтров

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
// Состояние для выбранного варианта товара
const [selectedVariant, setSelectedVariant] = useState<number>(0);
// Мемоизируем список изображений для текущего товара, чтобы избежать лишних пересчетов при рендере
const currentProductImages = useMemo(() => {
if (!slides[activeProduct]) return [];
// В режиме одного товара слайды и есть изображения, но для совместимости с галереей
// можно вернуть все изображения товара
if (productFromUid) {
  return slides.map(s => s.image);
}
return getProductImages(slides[activeProduct].product);
}, [activeProduct, slides, productFromUid]);

// Получаем актуальный артикул и цену на основе выбранного варианта
const currentArticle = useMemo(() => {
  const slide = slides[activeProduct];
  if (!slide) return '';
  const product = slide.product;
  if (product.variants && product.variants.length > 0) {
    return product.variants[selectedVariant]?.article || product.article || '';
  }
  return product.article || '';
}, [activeProduct, selectedVariant, slides]);

const currentPrice = useMemo(() => {
  const slide = slides[activeProduct];
  if (!slide) return '';
  const product = slide.product;
  if (product.variants && product.variants.length > 0) {
    return product.variants[selectedVariant]?.price || product.price;
  }
  return product.price;
}, [activeProduct, selectedVariant, slides]);

const nextSlide = () => {
setActiveProduct((prev) => (prev + 1) % slides.length);
// Сбрас варианта при смене товара (только если это другой товар, а не другое фото того же товара)
if (!productFromUid) {
  setSelectedVariant(0);
}
lastInteractionRef.current = Date.now();
};
const prevSlide = () => {
setActiveProduct((prev) => (prev - 1 + slides.length) % slides.length);
if (!productFromUid) {
  setSelectedVariant(0);
}
lastInteractionRef.current = Date.now();
};
const goToSlide = (index: number) => {
setActiveProduct(index);
if (!productFromUid) {
  setSelectedVariant(0);
}
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
// В режиме одного товара отключаем свайпы слайдера
if (productFromUid) return;

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
if (window.innerWidth > 1024 || productFromUid) return; // Только для планшетов и мобильных, и не для одиночного товара

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
setSelectedVariant(0);
}, [currentCollectionId]);
// Сброс состояния загрузки при смене слайда
useEffect(() => {
if (!slides[activeProduct]) return;

setImageLoaded(false);

// Предварительная загрузка текущего изображения
const img = new Image();
img.onload = () => setImageLoaded(true);
img.src = slides[activeProduct].image;

// Предварительная загрузка следующих изображений для быстрого отображения на планшетах
if (window.innerWidth <= 1024) {
  slides.forEach((slide, index) => {
    if (index !== activeProduct) {
      const preloadImg = new Image();
      preloadImg.src = slide.image;
    }
  });
}

}, [activeProduct, slides]); // Убираем filteredProducts из зависимостей, т.к. он теперь мемоизирован
// Автопроигрывание слайдов каждые 8 секунд
useEffect(() => {
// Приостанавливаем автопроигрывание, если открыта галерея, товаров меньше 2 или это страница одного товара
if (isGalleryOpen || slides.length <= 1 || productFromUid) {
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
      const next = (prev + 1) % slides.length;
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

}, [slides.length, isGalleryOpen]); // Добавляем isGalleryOpen в зависимости

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
if (isGalleryOpen || !sectionsRef.current || slides.length === 0 || !imageLoaded) return;

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

// В режиме одного товара открываем галерею на текущем изображении
if (productFromUid) {
  setGalleryActiveImage(activeProduct);
} else {
  setGalleryActiveImage(0); // В режиме коллекции начинаем с первого изображения товара
}
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
// Навигация слайдера только если это не страница одного товара
if (!productFromUid) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    prevSlide();
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    handleNextSlide();
  }
}
}
};

window.addEventListener('keydown', handleKeyDown);
return () => window.removeEventListener('keydown', handleKeyDown);
}, [isGalleryOpen, activeProduct, slides.length]);
// Если нет товаров в коллекции
if (slides.length === 0 && currentCollectionId) {
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
if (slides.length === 0) {
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
{/* Навигация стрелками - скрываем для одиночного товара */}
{!productFromUid && (
  <>
    <button className={styles.sliderArrow + ' ' + styles.sliderArrowLeft} onClick={(e) => {
    e.stopPropagation();
    prevSlide();
    }}>
    →</button>
    <button className={styles.sliderArrow + ' ' + styles.sliderArrowRight} onClick={(e) => {
    e.stopPropagation();
    handleNextSlide();
    }}>
    →</button>
  </>
)}
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
              className={`${styles.productBackground} ${slides[activeProduct].product.collection === 'dining groups' ? styles.productBackgroundDiningGroups : ''}`}
              style={{ backgroundImage: `url(${slides[activeProduct].image})` }}
              onClick={handleBackgroundClick}
              role="button"
              tabIndex={0}
              aria-label="Открыть галерею изображений"
            >
              {/* Контейнер-якорь для точек */}
              <div className={styles.dotsAnchor}>
                {/* Точки для переключения слайдов - скрываем для одиночного товара */}
                {!isGalleryOpen && !productFromUid && slides.length > 1 && (
                  <div className={styles.sliderDots}>
                      {slides.map((_, index) => (
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
                {currentArticle && (
                  <div className={styles.productArticle}>
                    Артикул: {currentArticle}
                  </div>
                )}
                <h2 className={styles.productName}>{slides[activeProduct].product.name}</h2>
                <p className={styles.productPrice}>{currentPrice}</p>
                
                {/* Переключатель вариантов */}
                {slides[activeProduct].product.variants && slides[activeProduct].product.variants!.length > 1 && (
                  <div className={styles.variantSelector}>
                    {slides[activeProduct].product.variants!.map((variant, index) => (
                      <button
                        key={index}
                        className={`${styles.variantButton} ${index === selectedVariant ? styles.variantButtonActive : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVariant(index);
                        }}
                      >
                        {variant.material}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className={styles.productDetails}>
                  
                  <div className={styles.productSpecsTable}>
                    {slides[activeProduct].product.specs.material && 
                     slides[activeProduct].product.specs.material.toLowerCase() !== 'не указан' && (
                      <div className={styles.specsRow}>
                        <div className={styles.specsLabel}>Материал</div>
                        <div className={styles.specsValue}>{slides[activeProduct].product.specs.material}</div>
                      </div>
                    )}
                    {slides[activeProduct].product.specs.dimensions && 
                     slides[activeProduct].product.specs.dimensions.toLowerCase() !== 'не указан' && 
                     slides[activeProduct].product.specs.dimensions.toLowerCase() !== 'не указаны' && (
                      <div className={styles.specsRow}>
                        <div className={styles.specsLabel}>Размеры</div>
                        <div className={styles.specsValue}>{slides[activeProduct].product.specs.dimensions}</div>
                      </div>
                    )}
                    {slides[activeProduct].product.specs.weight && 
                     slides[activeProduct].product.specs.weight.toLowerCase() !== 'не указан' && (
                      <div className={styles.specsRow}>
                        <div className={styles.specsLabel}>Вес</div>
                        <div className={styles.specsValue}>{slides[activeProduct].product.specs.weight}</div>
                      </div>
                    )}
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
export default ProductPage;
