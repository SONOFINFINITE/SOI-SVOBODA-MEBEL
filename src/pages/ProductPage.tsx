/**
 * Страница товара или коллекции. Роуты: /collections/:collectionName, /product/:uid.
 * Товары: локальные + XML. overrides — правки из админки (название, цена, картинка, акция).
 */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../components/Header/Header';
import { Footer } from '../components/Footer/footer';
import PhoneButton from '../components/PhoneButton/phone-button';
import ModalGallery from '../components/ModalGallery/ModalGallery';
import { products as localProducts, getCollectionIdFromName, getProductImages, combineProducts } from '../data/catalog';
import type { Product } from '../data/catalog';
import { fetchXmlProducts, getPublicProductOverrides } from '../utils/api';
import type { ProductOverrides } from '../utils/api';
import { useCart } from '../context/CartContext';
import { usePageMeta } from '../utils/seo';
import styles from './ProductPage.module.scss';

gsap.registerPlugin(ScrollTrigger);
const parsePrice = (priceStr: string): number => parseInt(priceStr.replace(/\D/g, ''), 10) || 0;

const ProductPage: React.FC = () => {
const { collectionId, collectionName, uid } = useParams<{ collectionId?: string; collectionName?: string; uid?: string }>();
const navigate = useNavigate();
const [searchParams] = useSearchParams();
const { addItem } = useCart();

const [xmlProducts, setXmlProducts] = useState<Product[]>([]);
const [overrides, setOverrides] = useState<ProductOverrides>({});

const products = useMemo(() => {
  return combineProducts(localProducts, xmlProducts);
}, [xmlProducts]);

useEffect(() => {
  const loadXmlProducts = async () => {
    try {
      const xmlData = await fetchXmlProducts();
      setXmlProducts(xmlData);
    } catch (error) {
      console.error('Ошибка загрузки XML продуктов:', error);
    }
  };

  loadXmlProducts();
}, []);

useEffect(() => {
  getPublicProductOverrides().then(setOverrides);
}, []);

const productFromUid = useMemo(() => uid ? products.find(p => p.uid === uid) : null, [uid, products]);

const currentCollectionId = useMemo(() => {
  if (collectionName) {
    const fromName = getCollectionIdFromName(collectionName);
    if (fromName) return fromName;
    return collectionName.toLowerCase().replace(/\s+/g, '-');
  }
  if (collectionId) return collectionId;
  if (productFromUid) return productFromUid.collection;
  return null;
}, [collectionName, collectionId, productFromUid]);

const pageTitle = productFromUid ? productFromUid.name : (currentCollectionId ? 'Коллекция' : 'Товар');
const pageDescription = productFromUid
  ? `${productFromUid.name}. Мебель СВОБОДА. ${productFromUid.price}`
  : 'Мебель из коллекций СВОБОДА. Каталог товаров.';
usePageMeta(pageTitle, pageDescription);

const categoryParam = searchParams.get('category');

const goToCatalogWithFilters = useCallback(() => {
  if (!currentCollectionId) return;
  const params = new URLSearchParams();
  params.append('collection', currentCollectionId);
  if (categoryParam && categoryParam !== 'all') {
    params.append('category', categoryParam);
  }
  navigate(`/catalog?${params.toString()}`);
}, [categoryParam, currentCollectionId, navigate]);

  const filteredProducts = useMemo(() => {
    let filtered = currentCollectionId
      ? products.filter(product => product.collection === currentCollectionId)
      : products;
    
   
    if (categoryParam && categoryParam !== 'all') {
      filtered = filtered.filter(product => product.category === categoryParam);
    }
    
    return filtered;
  }, [currentCollectionId, categoryParam, products]);

  const slides = useMemo(() => {
    if (productFromUid) {
      const images = getProductImages(productFromUid);
      if (images.length === 0) {
        return [{
          product: productFromUid,
          image: productFromUid.image
        }];
      }
      return images.map(img => ({
        product: productFromUid,
        image: img
      }));
    }
    return filteredProducts.map(p => ({
      product: p,
      image: p.image
    }));
  }, [productFromUid, filteredProducts]);

  useEffect(() => {
    if ((collectionName || collectionId) && !currentCollectionId) {
      navigate('/collections');
    }
  }, [collectionId, collectionName, currentCollectionId, navigate]);

  const [activeProduct, setActiveProduct] = useState(0);

  useEffect(() => {
    if (productFromUid) {
      setActiveProduct(0);
    } else if (filteredProducts.length > 0) {
    }
  }, [productFromUid, filteredProducts]);

const sectionsRef = useRef<HTMLDivElement>(null);
const productRefs = useRef<(HTMLDivElement | null)[]>([]);
const autoPlayRef = useRef<number | null>(null);
const lastInteractionRef = useRef<number>(Date.now());
const [isGalleryOpen, setIsGalleryOpen] = useState(false);
const [galleryActiveImage, setGalleryActiveImage] = useState(0);
const [touchStart, setTouchStart] = useState<number | null>(null);
const [touchEnd, setTouchEnd] = useState<number | null>(null);
const [, setIsDragging] = useState(false);
const [touchStartedInInfo, setTouchStartedInInfo] = useState(false);
const [imageLoaded, setImageLoaded] = useState(false);
const [selectedVariant, setSelectedVariant] = useState<number>(0);
const currentProductImages = useMemo(() => {
if (!slides[activeProduct]) return [];
if (productFromUid) {
  return slides.map(s => s.image);
}
return getProductImages(slides[activeProduct].product);
}, [activeProduct, slides, productFromUid]);

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

const currentProductUid = useMemo(() => {
  const slide = slides[activeProduct];
  if (!slide) return '';
  const p = slide.product;
  return p.uid || `${p.collection}-${p.id}`;
}, [activeProduct, slides]);

const displayOverrides = useMemo(() => {
  const slide = slides[activeProduct];
  if (!slide) return { name: '', price: '', image: '', isSale: false, basePrice: '' };
  const o = overrides[currentProductUid];
  const basePrice = o?.price ?? (currentPrice || slide.product.price);
  const isSale = !!(o?.isSale && o?.salePrice);
  const price = isSale ? o!.salePrice! : basePrice;
  return {
    name: o?.name ?? slide.product.name,
    price,
    image: o?.image ?? slide.image,
    isSale,
    basePrice,
  };
}, [activeProduct, slides, overrides, currentProductUid, currentPrice]);

const nextSlide = () => {
setActiveProduct((prev) => (prev + 1) % slides.length);
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
const minSwipeDistance = 50;
const onTouchStart = (e: React.TouchEvent) => {
if (productFromUid) return;
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
const deltaX = Math.abs(currentX - touchStart);
if (deltaX > 10) {
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
const onMouseDown = (e: React.MouseEvent) => {
if (window.innerWidth > 1024 || productFromUid) return;

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
useEffect(() => {
setActiveProduct(0);
setSelectedVariant(0);
}, [currentCollectionId]);
useEffect(() => {
if (!slides[activeProduct]) return;

setImageLoaded(false);
const img = new Image();
img.onload = () => setImageLoaded(true);
img.src = slides[activeProduct].image;
if (window.innerWidth <= 1024) {
  slides.forEach((slide, index) => {
    if (index !== activeProduct) {
      const preloadImg = new Image();
      preloadImg.src = slide.image;
    }
  });
}

}, [activeProduct, slides]);
useEffect(() => {
if (isGalleryOpen || slides.length <= 1 || productFromUid) {
if (autoPlayRef.current) {
clearInterval(autoPlayRef.current);
autoPlayRef.current = null;
}
return;
}
if (autoPlayRef.current) {
  clearInterval(autoPlayRef.current);
}
autoPlayRef.current = window.setInterval(() => {
  const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
  if (timeSinceLastInteraction >= 8000) {
    setActiveProduct((prev) => {
      const next = (prev + 1) % slides.length;
      lastInteractionRef.current = Date.now();
      return next;
    });
  }
}, 1000);

return () => {
  if (autoPlayRef.current) {
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = null;
  }
};

}, [slides.length, isGalleryOpen]);

useEffect(() => {
  if (isGalleryOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
  return () => {
    document.body.style.overflow = 'auto';
  };
}, [isGalleryOpen]);

useEffect(() => {
if (isGalleryOpen || !sectionsRef.current || slides.length === 0 || !imageLoaded) return;

const sections = productRefs.current.filter(Boolean);
const currentSection = sections[activeProduct];

if (currentSection) {
  const infoContent = currentSection.querySelector(`.${styles.productInfoContent}`);
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
}, [activeProduct, imageLoaded]);
const handleBackgroundClick = (e: React.MouseEvent) => {
e.stopPropagation();
e.preventDefault();
setIsGalleryOpen(true);
if (productFromUid) {
  setGalleryActiveImage(activeProduct);
} else {
  setGalleryActiveImage(0);
}
};
const closeGallery = useCallback(() => {
  setIsGalleryOpen(false);
  lastInteractionRef.current = Date.now();
}, []);

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
{!productFromUid && (
  <>
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
  </>
)}
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
              style={{ backgroundImage: `url(${displayOverrides.image})` }}
              onClick={handleBackgroundClick}
              role="button"
              tabIndex={0}
              aria-label="Открыть галерею изображений"
            >
              <div className={styles.dotsAnchor}>
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
                <h2 className={styles.productName}>{displayOverrides.name}</h2>
                <p className={styles.productPrice}>
                  {displayOverrides.isSale ? (
                    <>
                      <span className={styles.oldPrice}>{displayOverrides.basePrice}</span>{' '}
                      <span className={styles.salePrice}>{displayOverrides.price}</span>
                    </>
                  ) : (
                    displayOverrides.price
                  )}
                </p>
                
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

                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    className={styles.buyButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      const p = slides[activeProduct].product;
                      const productUid = p.uid || `${p.collection}-${p.id}`;
                      addItem({
                        productUid,
                        name: displayOverrides.name,
                        price: displayOverrides.price,
                        priceNum: parsePrice(displayOverrides.price),
                        image: displayOverrides.image,
                        quantity: 1,
                        article: p.variants?.[selectedVariant]?.article ?? p.article,
                      });
                    }}
                  >
                    Купить
                  </button>
                  {!productFromUid && currentCollectionId && (
                    <button
                      type="button"
                      className={styles.catalogButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToCatalogWithFilters();
                      }}
                    >
                      Смотреть в каталоге
                    </button>
                  )}
                </div>
                
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
