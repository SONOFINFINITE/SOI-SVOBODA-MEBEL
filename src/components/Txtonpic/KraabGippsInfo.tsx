import React from 'react';
import styles from './KraabGippsInfo.module.scss';
import kraabImage from '../../../public/images/888788.webp';

export const KraabGippsInfo: React.FC = () => {
  return (
    <section id="textonpic" className={styles.kraabGipps}>
      <img src={kraabImage} alt="Мебель из цельной древесины" className={styles.kraabGipps__background} />
      <div className={styles.kraabGipps__container}>
        <div className={styles.kraabGipps__prefix}>ЭКОЛОГИЧНЫЕ РЕШЕНИЯ</div>
        <h2 className={styles.kraabGipps__title}>МЕБЕЛЬ ИЗ ЦЕЛЬНОЙ ДРЕВЕСИНЫ</h2>
        <div className={styles.kraabGipps__content}>
          <div className={styles.kraabGipps__text}>
            <p>
              Позволяет создать интерьер в гармонии с природой, благодаря уникальным текстурам 
              и естественным оттенкам натурального дерева, наполняющим пространство теплом и уютом.
            </p>
            <p>
              Изделия из цельной древесины прекрасно сочетаются как с современными, так и с классическими 
              стилями оформления, создавая атмосферу экологичности и близости к природным истокам.
            </p>
          </div>
          <div className={styles.kraabGipps__text}>
            <p>
              Натуральное дерево обладает уникальными свойствами, благотворно влияющими на микроклимат 
              помещения, регулируя влажность и создавая здоровую атмосферу для жизни и работы, 
              что позволяет находиться в полной гармонии с окружающей средой.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KraabGippsInfo; 