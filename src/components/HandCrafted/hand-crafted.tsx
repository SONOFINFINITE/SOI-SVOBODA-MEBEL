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
                    <p className={styles['hc__section-description']}>ПРОИЗВОДСТВО</p>
                    <h2 className={styles['hc__section-heading']}>Ручная работа</h2>
                </div>
                        <div className={styles.hc__text}>
                            <p className={styles['hc__description']}>
                                Вдали от промышленного производства, наша мебель демонстрирует высочайшее мастерство изготовления вручную. 
                                От конструкции каждого твердого дубового каркаса до создания подушек, 
                                мы дорожим качеством и уникальностью наших тщательно изготовленных изделий, 
                                чьи отделочные штрихи подчеркивают их уникальный, простой и элегантный дизайн.
                            </p>
                            <p className={styles['hc__description']}>
                                Каждое изделие в нашей коллекции создано руками опытных мастеров, которые вкладывают душу и многолетний опыт в каждую деталь. 
                                Мы не используем массовое производство, предпочитая индивидуальный подход к каждому заказу.
                                Это позволяет нам контролировать качество на каждом этапе и создавать мебель, которая прослужит поколениям.
                            </p>
                            <p className={styles['hc__description']}>
                                Наши мастера работают с натуральными материалами высочайшего качества, соблюдая традиции ремесленного производства и применяя современные технологии 
                                только там, где это действительно необходимо.
                            </p>
                        </div>
                        <div className={styles.hc__marquee}>
                            <Marquee
                                gradient={false}
                                speed={80}
                                direction="left"
                            >
                                <div className={styles['hc__marquee-item']}>ПЕРЕРАБОТАНО</div>
                                <div className={styles['hc__marquee-item']}>КАЧЕСТВО</div>
                                <div className={styles['hc__marquee-item']}>РУЧНАЯ РАБОТА</div>
                                <div className={styles['hc__marquee-item']}>МАСТЕРСТВО</div>
                                <div className={styles['hc__marquee-item']}>УНИКАЛЬНОСТЬ</div>
                            </Marquee>
                        </div>
                    </div>
                    <div className={styles.hc__image}>
                        <img 
                            src="/images/handmade.jpg" 
                            alt="Ручная работа над мебелью" 
                            className={styles['hc__image-item']}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}; 