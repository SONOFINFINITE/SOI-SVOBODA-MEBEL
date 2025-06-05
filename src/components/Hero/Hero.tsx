import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Hero.module.scss";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  badge: {
    text: string;
    color: string;
  };
}

const slides: Slide[] = [
  {
    id: 1,
    title: "МЕБЕЛЬ ДЛЯ СЕГОДНЯ ИЛИ НАВСЕГДА",
    subtitle:
      "Создайте уютное пространство с нашей коллекцией современной мебели",
    image: "/images/slide-1.webp",
    badge: {
      text: "Вдохновение",
      color: "pink",
    },
  },
  {
    id: 2,
    title: "СТИЛЬНЫЕ РЕШЕНИЯ ДЛЯ ВАШЕГО ДОМА",
    subtitle: "Откройте для себя уникальные дизайны и качественные материалы",
    image: "/images/slide-2.webp",
    badge: {
      text: "Популярное",
      color: "green",
    },
  },
  {
    id: 3,
    title: "КОМФОРТ И ЭЛЕГАНТНОСТЬ В КАЖДОЙ ДЕТАЛИ",
    subtitle: "Превратите свой дом в место, где хочется находиться",
    image: "/images/slide-3.webp",
    badge: {
      text: "Подборка",
      color: "blue",
    },
  },
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [badgeVisible, setBadgeVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setBadgeVisible(false);
    
    const badgeTimer = setTimeout(() => {
      setBadgeVisible(true);
    }, 500);
    
    return () => {
      clearTimeout(badgeTimer);
    };
  }, [currentSlide]);


  return (
    <section className={styles.hero}>
      <div className={styles.hero__slider}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.hero__slide} ${
              index === currentSlide ? styles.hero__slide_active : ""
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          >
            <div className={styles.hero__container}>
              <div className={styles.hero__content}>
                <div 
                  className={`${styles.hero__badge} ${styles[`hero__badge_${slide.badge.color}`]} ${
                    index === currentSlide && badgeVisible ? styles.hero__badge_visible : ""
                  }`}
                >
                  {slide.badge.text}
                </div>
                <h1 className={styles.hero__title}>{slide.title}</h1>
                <p className={styles.hero__subtitle}>{slide.subtitle}</p>
                
              </div>
              <Link to="/catalog" className={styles.hero__cta}>
                  <span>В КАТАЛОГ</span>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.hero__ctaIcon}
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
