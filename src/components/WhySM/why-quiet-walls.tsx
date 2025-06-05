import { type FC, useEffect, useRef } from 'react';
import classNames from 'classnames';
import styles from './why-quiet-walls.module.scss';
import { Package, Truck, RefreshCcw } from 'lucide-react';

export interface WhyQuietWallsProps {
    className?: string;
}

export const WhySM: FC<WhyQuietWallsProps> = ({ className }) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    cardsRef.current.forEach((card, index) => {
                        if (card) {
                            setTimeout(() => {
                                card.classList.add(styles['wqw__card--visible']);
                            }, index * 150);
                        }
                    });
                }
            },
            {
                threshold: 0.2
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const advantages = [
        {
            icon: <Package className={styles['wqw__card-icon-svg']} />,
            title: 'Сделано на заказ',
            description: 'Все изделия изготавливаются индивидуально для вас'
        },
        {
            icon: <Truck className={styles['wqw__card-icon-svg']} />,
            title: 'Бесплатная доставка',
            description: 'Бесплатная доставка для заказов по всему городу'
        },
        {
            icon: <RefreshCcw className={styles['wqw__card-icon-svg']} />,
            title: 'Бесплатный обмен',
            description: 'Бесплатный обмен на все товары в нашем ассортименте'
        }
    ];

    return (
        <section id="services" className={styles.wqw__wrapper} ref={sectionRef}>
            <div className={styles['wqw__content-wrapper']}>
                <div className={styles.wqw__heading}>
                <p className={styles['wqw__section-description']}>ПОЧЕМУ ВЫБИРАЮТ НАС</p>
                    <h2 className={styles['wqw__section-heading']}>Наши преимущества</h2>
                  
                </div>
                <div className={classNames(styles['wqw__grid-wrapper'], className)}>
                    {advantages.map((advantage, index) => (
                        <div 
                            className={styles.wqw__card} 
                            key={index} 
                            ref={(el) => {
                                if (el) {
                                    cardsRef.current[index] = el;
                                }
                            }}
                        >
                            <div className={styles['wqw__card-icon']}>
                                {advantage.icon}
                            </div>
                            <div className={styles['wqw__card-content']}>
                                <h3 className={styles['wqw__card-title']}>{advantage.title}</h3>
                                <p className={styles['wqw__card-text']}>{advantage.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
