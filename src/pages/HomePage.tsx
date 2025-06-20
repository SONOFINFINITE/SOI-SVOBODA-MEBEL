import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import { WhySM } from '../components/WhySM/why-quiet-walls';
import { HandCrafted } from '../components/HandCrafted/hand-crafted';
import KraabGippsInfo from '../components/Txtonpic/KraabGippsInfo';
import { Faq } from '../components/faq/faq';
import { Footer } from '../components/Footer/footer';
import PhoneButton from '../components/PhoneButton/phone-button';
import styles from './HomePage.module.scss';

const HomePage: React.FC = () => {
  const [, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Имитация загрузки
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Проверяем, есть ли параметр scrollToId в state
      if (location.state && location.state.scrollToId) {
        const id = location.state.scrollToId;
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100); // Небольшая задержка, чтобы элементы успели отрендериться
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [location.state]);

  return (
    <>
      {/* Загрузочный экран */}
      <div className={styles.loaderContainer}>
        <div className={styles.loader}>
          <div className={styles.loaderBar}></div>
        </div>
      </div>
      
      <div>
        <Header />
        <Hero />
        <WhySM />
        <HandCrafted />
        <KraabGippsInfo />
        <Faq />
        <Footer />
        <PhoneButton />
      </div>
    </>
  );
};

export default HomePage; 