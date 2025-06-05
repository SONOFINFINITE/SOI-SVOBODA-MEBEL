import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import { WhySM } from '../components/WhySM/why-quiet-walls';
import { HandCrafted } from '../components/HandCrafted/hand-crafted';
import KraabGippsInfo from '../components/Txtonpic/KraabGippsInfo';
import { Faq } from '../components/faq/faq';
import { Footer } from '../components/Footer/footer';
import styles from './HomePage.module.scss';

const HomePage: React.FC = () => {
  const [, setLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Загрузочный экран */}
      <div className={styles.loaderContainer}>
        <div className={styles.loader}>
          <span className={styles.loaderText}>Главная</span>
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
      </div>
    </>
  );
};

export default HomePage; 