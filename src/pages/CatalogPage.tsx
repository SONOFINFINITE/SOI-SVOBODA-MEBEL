import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../components/Header/Header';
import { Footer } from '../components/Footer/footer';
import styles from './CatalogPage.module.scss';

// Регистрируем плагин ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Данные о товарах
const products = [
  {
    id: 1,
    name: 'Hugo',
    description: 'Современная лавка с элегантным дизайном и удобной посадкой. Идеально подходит для прихожей или веранды.',
    price: '45 000 ₽',
    image: '/images/Каталог/Hugo-2.webp',
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
    specs: {
      material: 'Массив сосны, хлопок, лён',
      dimensions: '220 × 95 × 85 см',
      weight: '45 кг'
    }
  }
];

const CatalogPage: React.FC = () => {
  const [activeProduct, setActiveProduct] = useState(0);
  const [loading, setLoading] = useState(true);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Имитация загрузки
    const timer = setTimeout(() => {
      // Не убираем загрузочный экран из DOM сразу, 
      // анимация fadeOut сработает благодаря CSS
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sectionsRef.current) return;

    const sections = productRefs.current.filter(Boolean);
    
    // Устанавливаем начальную прозрачность для всех секций, кроме первой
    gsap.set(sections.slice(1), { opacity: 0 });
    
    // Создаем ScrollTrigger для каждой секции
    sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveProduct(i),
        onEnterBack: () => setActiveProduct(i),
        markers: false
      });

      // Анимация для каждого продукта при скролле
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'center center',
          scrub: 1
        }
      })
      .fromTo(section, 
        { y: 0, opacity: 0.5 }, 
        { y: 0, opacity: 1, duration: 1.6 }
      );
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [loading]);

  return (
    <>
      {/* Загрузочный экран будет скрыт через CSS-анимацию */}
      <div className={styles.loaderContainer}>
        <div className={styles.loader}>
          <span className={styles.loaderText}>Каталог</span>
          <div className={styles.loaderBar}></div>
        </div>
      </div>
      
      <div className={styles.catalogPage}>
        <div className={styles.catalogContent}>
          <div className={styles.productShowcase} ref={sectionsRef}>
            <Header />
            
            {products.map((product, index) => (
              <div 
                key={product.id} 
                ref={(el) => {
                  if (el) {
                    productRefs.current[index] = el;
                  }
                }}
                className={styles.productSection}
              >
                <div className={styles.productFullscreenWrapper}>
                  <div className={styles.productBackground} style={{ backgroundImage: `url(${product.image})` }} />
                  
                  <div className={`${styles.productInfoOverlay} ${index % 2 === 0 ? styles.infoLeft : styles.infoRight}`}>
                    <div className={styles.productInfoContent}>
                      <h2 className={styles.productName}>{product.name}</h2>
                      <p className={styles.productPrice}>{product.price}</p>
                      
                      <div className={styles.productDetails}>
                        <p className={styles.productDescription}>{product.description}</p>
                        
                        <div className={styles.productSpecsTable}>
                          <div className={styles.specsRow}>
                            <div className={styles.specsLabel}>Материал</div>
                            <div className={styles.specsValue}>{product.specs.material}</div>
                          </div>
                          <div className={styles.specsRow}>
                            <div className={styles.specsLabel}>Размеры</div>
                            <div className={styles.specsValue}>{product.specs.dimensions}</div>
                          </div>
                          <div className={styles.specsRow}>
                            <div className={styles.specsLabel}>Вес</div>
                            <div className={styles.specsValue}>{product.specs.weight}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.productNavigation}>
            {products.map((product, index) => (
              <button 
                key={product.id}
                className={`${styles.navDot} ${activeProduct === index ? styles.navDotActive : ''}`}
                onClick={() => {
                  const targetSection = productRefs.current[index];
                  if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <span className={styles.srOnly}>{product.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default CatalogPage; 