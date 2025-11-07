import { useLocation, useNavigate } from 'react-router-dom';
import styles from './footer.module.scss';

import SVOBODA_LOGO_BLACK from '../../assets/SVOBODA_LOGO_BLACK.png';
import SVOBODA_LOGO_WHITE from '../../assets/SVOBODA_LOGO_WHITE.png';
import classNames from 'classnames';

export interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isCatalogPage = location.pathname.includes('/catalog') || 
                         (location.pathname.includes('/collections') && location.pathname !== '/collections');
    
    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        if (isCatalogPage) {
            navigate('/', { state: { scrollToId: id.replace('#', '') } });
        } else {
            document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    return (
        <footer className={classNames(styles.footer, isCatalogPage ? styles.footer_dark : styles.footer_light, className)}>
            <div className={styles.footer__wrapper}>
                <div className={styles.footer__left}>
                    <div className={styles.footer__logo}>
                        <a href="/" className={styles.footer__logoLink}>
                            <img 
                                src={isCatalogPage ? SVOBODA_LOGO_WHITE : SVOBODA_LOGO_BLACK} 
                                alt="SVOBODA Logo" 
                                style={{ height: '85px', width: 'auto'}}
                                className={styles.footer__logoImg}
                            />
                        </a>
                    </div>
                    <div className={styles.footer__social}>
                        <a href="https://wa.me/+79108237272" target="_blank" rel="noopener noreferrer" className={styles.social__link}>
                            <svg fill={isCatalogPage ? "#ffffff" : "#000000"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">    
                                <path d="M25,2C12.318,2,2,12.318,2,25c0,3.96,1.023,7.854,2.963,11.29L2.037,46.73c-0.096,0.343-0.003,0.711,0.245,0.966 C2.473,47.893,2.733,48,3,48c0.08,0,0.161-0.01,0.24-0.029l10.896-2.699C17.463,47.058,21.21,48,25,48c12.682,0,23-10.318,23-23 S37.682,2,25,2z M36.57,33.116c-0.492,1.362-2.852,2.605-3.986,2.772c-1.018,0.149-2.306,0.213-3.72-0.231 c-0.857-0.27-1.957-0.628-3.366-1.229c-5.923-2.526-9.791-8.415-10.087-8.804C15.116,25.235,13,22.463,13,19.594 s1.525-4.28,2.067-4.864c0.542-0.584,1.181-0.73,1.575-0.73s0.787,0.005,1.132,0.021c0.363,0.018,0.85-0.137,1.329,1.001 c0.492,1.168,1.673,4.037,1.819,4.33c0.148,0.292,0.246,0.633,0.05,1.022c-0.196,0.389-0.294,0.632-0.59,0.973 s-0.62,0.76-0.886,1.022c-0.296,0.291-0.603,0.606-0.259,1.19c0.344,0.584,1.529,2.493,3.285,4.039 c2.255,1.986,4.158,2.602,4.748,2.894c0.59,0.292,0.935,0.243,1.279-0.146c0.344-0.39,1.476-1.703,1.869-2.286 s0.787-0.487,1.329-0.292c0.542,0.194,3.445,1.604,4.035,1.896c0.59,0.292,0.984,0.438,1.132,0.681 C37.062,30.587,37.062,31.755,36.57,33.116z"/>
                            </svg>
                        </a>
                    </div>
                </div>
                
                <div className={styles.footer__marquee_container}>
                    <div className={styles.footer__marquee}>
                        <div className={styles.footer__marquee_content}>
                            <span>#НАШИ_КОНТАКТЫ</span>
                            <span>#НАШИ_КОНТАКТЫ</span>
                            <span>#НАШИ_КОНТАКТЫ</span>
                        </div>
                    </div>
                </div>

                <div className={styles.footer__right}>
                <div className={styles.contact__info}>
                        <p className={styles.contact__email}>
                            <span className={styles.contact__icon}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 3H2C1.4 3 1 3.4 1 4V12C1 12.6 1.4 13 2 13H14C14.6 13 15 12.6 15 12V4C15 3.4 14.6 3 14 3ZM13.8 4L8 8.1L2.2 4H13.8ZM2 12V4.6L7.9 8.8C7.9 8.8 8 8.9 8 8.9C8 8.9 8.1 8.8 8.1 8.8L14 4.6V12H2Z" fill={isCatalogPage ? "white" : "currentColor"}/>
                                </svg>
                            </span>
                            svobodameb@gmail.com
                        </p>
                        <p className={styles.contact__phone}>
                            <span className={styles.contact__icon}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.7 11.3L12.1 9.9C11.5 9.6 10.8 9.7 10.3 10.2L9.5 11C9.4 11.1 9.2 11.1 9.1 11L9 10.9C8.4 10.5 7.7 9.9 7 9.2C6.3 8.5 5.7 7.8 5.3 7.2L5.2 7.1C5.1 7 5.1 6.8 5.2 6.7L6 5.9C6.5 5.4 6.6 4.7 6.3 4.1L4.9 1.5C4.6 0.8 3.8 0.5 3.1 0.8L1.8 1.4C1.1 1.7 0.6 2.3 0.5 3.1C0.3 5.6 1.2 8.2 4.1 11.1C7.8 14.8 11.4 14.8 11.9 14.8C12.6 14.8 13.2 14.5 13.7 14.2L15 13.1C15.7 12.4 15.4 11.6 14.7 11.3Z" fill={isCatalogPage ? "white" : "currentColor"}/>
                                </svg>
                            </span>
                            +7 (910) 823-72-72
                        </p>
                    </div>
                </div>
            </div>
            <div className={styles.footer__bottom}>
                <div className={styles.footer__copyright}>
                    <p>Свобода Мебель © {new Date().getFullYear()}</p>
                </div>
                <div className={styles.footer__menu}>
                    <a href="#services" className={styles.footer__bottom_link} onClick={(e) => handleSmoothScroll(e, '#services')}>Почему мы</a>
                    <a href="#hc" className={styles.footer__bottom_link} onClick={(e) => handleSmoothScroll(e, '#hc')}>Производство</a>
                    <a href="#textonpic" className={styles.footer__bottom_link} onClick={(e) => handleSmoothScroll(e, '#textonpic')}>Экологичность</a>
                    <a href="#faq" className={styles.footer__bottom_link} onClick={(e) => handleSmoothScroll(e, '#faq')}>FAQ</a>
                    <a href="/collections" className={styles.footer__bottom_link}>Коллекции</a> 
                    
                </div>
            </div>
        </footer>
    );
};
