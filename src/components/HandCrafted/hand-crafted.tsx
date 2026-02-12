import { type FC } from 'react';
import classNames from 'classnames';
import styles from './hand-crafted.module.scss';
import Marquee from 'react-fast-marquee';

export interface HandCraftedProps {
    className?: string;
}

export const HandCrafted: FC<HandCraftedProps> = ({ className }) => {
    return (
        <section id="hc" className={styles.hc__wrapper}>
            <div className={styles['hc__content-wrapper']}>
                

                <div className={classNames(styles.hc__container, className)}>
                    <div className={styles.hc__left}>
                    <div className={styles.hc__heading}>
                    <p className={styles['hc__section-description']}>КАТАЛОГ</p>
                    <h2 className={styles['hc__section-heading']}>Проверенная мебель известных брендов</h2>
                </div>
                        <div className={styles.hc__text}>
                            <p className={styles['hc__description']}>
                                В нашем интернет-магазине — современная мебель проверенных брендов: гостиные, спальни, прихожие, 
                                столы и стулья, комоды и тумбы. Подбирайте коллекции под свой стиль: минимализм, сканди, лофт или классика.
                            </p>
                            <p className={styles['hc__description']}>
                                Мы собрали мебель разных производителей в одном месте: от лаконичных серий до выразительного дизайна. 
                                Удобные фильтры по коллекциям и категориям помогают быстро найти нужное для гостиной, спальни или кабинета.
                            </p>
                            <p className={styles['hc__description']}>
                                Качество и актуальный дизайн — то, что объединяет все бренды в нашем каталоге. 
                                Выбирайте готовые решения или комбинируйте предметы из разных коллекций для индивидуального интерьера.
                            </p>
                        </div>
                        <div className={styles.hc__marquee}>
                            <Marquee
                                gradient={false}
                                speed={80}
                                direction="left"
                            >
                                <div className={styles['hc__marquee-item']}>БРЕНДЫ</div>
                                <div className={styles['hc__marquee-item']}>КОЛЛЕКЦИИ</div>
                                <div className={styles['hc__marquee-item']}>СОВРЕМЕННАЯ МЕБЕЛЬ</div>
                                <div className={styles['hc__marquee-item']}>ДИЗАЙН</div>
                                <div className={styles['hc__marquee-item']}>КАЧЕСТВО</div>
                            </Marquee>
                        </div>
                    </div>
                    <div className={styles.hc__image}>
                        <img 
                            src="/images/slide-2.webp" 
                            alt="Современная мебель от лучших брендов в каталоге" 
                            className={styles['hc__image-item']}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}; 