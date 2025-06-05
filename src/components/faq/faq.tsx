import { useState } from 'react';
import classNames from 'classnames';
import styles from './faq.module.scss';

export interface FaqProps {
    className?: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

const faqData: FaqItem[] = [
    {
        question: 'КАК ВЫБРАТЬ КАЧЕСТВЕННУЮ МЕБЕЛЬ?',
        answer: 'При выборе мебели обращайте внимание на качество материалов, фурнитуру и сборку. Качественная мебель должна иметь ровные швы, надежные крепления и сертификаты соответствия. Наши консультанты помогут вам сделать правильный выбор.'
    },
    {
        question: 'КАКИЕ СРОКИ ДОСТАВКИ МЕБЕЛИ?',
        answer: 'Сроки доставки зависят от выбранной модели и наличия на складе. Стандартная мебель доставляется в течение 3-5 рабочих дней, мебель на заказ – от 2 до 4 недель. Точные сроки уточняйте у менеджера.'
    },
    {
        question: 'КАК УХАЖИВАТЬ ЗА МЕБЕЛЬЮ ИЗ МАССИВА?',
        answer: 'Мебель из массива требует бережного ухода: регулярно протирайте поверхность мягкой влажной тканью, избегайте прямых солнечных лучей и резких перепадов температуры. Для защиты древесины используйте специальные полироли на основе воска.'
    },
    {
        question: 'ПРЕДОСТАВЛЯЕТЕ ЛИ ВЫ УСЛУГИ СБОРКИ?',
        answer: 'Да, мы предлагаем профессиональную сборку всей приобретенной у нас мебели. Услуга сборки оплачивается дополнительно и выполняется квалифицированными специалистами в удобное для вас время.'
    },
    {
        question: 'ЕСТЬ ЛИ ГАРАНТИЯ НА МЕБЕЛЬ?',
        answer: 'Мы предоставляем гарантию на всю нашу мебель от 12 до 36 месяцев в зависимости от категории изделия. Гарантия распространяется на производственные дефекты и не распространяется на повреждения, возникшие в результате неправильной эксплуатации.'
    }
];

export const Faq = ({ className }: FaqProps) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div id="faq" className={classNames(styles.root, className)}>
            <div className={styles.faq__wrapper}>
                <span className={styles.__section_prefix}>FAQ</span>
                <h2 className={styles.__section_heading}>Часто задаваемые вопросы</h2>
                <div className={styles.faq__accordion}>
                    {faqData.map((item, index) => (
                        <div
                            key={index}
                            className={classNames(styles.faq__item, {
                                [styles.active]: activeIndex === index
                            })}
                            onClick={() => toggleAccordion(index)}
                        >
                            <div className={styles.faq__question}>
                                <span>{item.question}</span>
                                <div className={styles.faq__icon}></div>
                            </div>
                            <div className={styles.faq__answer}>
                                <p>{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
