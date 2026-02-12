import React from 'react';
import styles from './KraabGippsInfo.module.scss';

export const KraabGippsInfo: React.FC = () => {
  return (
    <section id="textonpic" className={styles.kraabGipps}>
      <img src="/images/slide-3.webp" alt="Мебель из натурального дерева и качественных материалов" className={styles.kraabGipps__background} />
      <div className={styles.kraabGipps__container}>
        <div className={styles.kraabGipps__prefix}>КАТАЛОГ МЕБЕЛИ</div>
        <h2 className={styles.kraabGipps__title}>КАЧЕСТВО И МАТЕРИАЛЫ</h2>
        <div className={styles.kraabGipps__content}>
          <div className={styles.kraabGipps__text}>
            <p>
              В каталоге — мебель из натурального дерева, шпона и надёжных материалов: столы, стулья, 
              комоды, тумбы и шкафы в современном стиле. Натуральные текстуры и оттенки дерева делают интерьер тёплым и долговечным.
            </p>
            <p>
              Мебель из массива и шпона хорошо смотрится и в минималистичном, и в классическом интерьере. 
              Мы подбираем бренды с продуманной конструкцией и отделкой, чтобы мебель служила годами.
            </p>
          </div>
          <div className={styles.kraabGipps__text}>
            <p>
              При выборе обращайте внимание на материал и отделку: дуб, орех, бук и качественный МДФ 
              дают стабильную геометрию и приятный вид. В карточках товаров указаны материалы и размеры для удобного подбора мебели под ваше пространство.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KraabGippsInfo; 