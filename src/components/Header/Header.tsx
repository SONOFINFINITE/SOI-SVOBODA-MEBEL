import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.scss';
import DrawerMenu from '../Drawer/drawer-menu';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Проверяем, находимся ли мы на странице каталога или коллекций
  const isCatalogPage = location.pathname.includes('/catalog') || 
                       (location.pathname.includes('/collections') && location.pathname !== '/collections');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Проверяем, прокручена ли страница достаточно для изменения стиля
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Определяем классы хедера в зависимости от страницы и состояния скролла
  const headerClasses = [
    styles.header,
    isCatalogPage ? (isScrolled ? styles.scrolled : '') : styles.mainPage,
    !isCatalogPage && isScrolled ? styles.scrolled : ''
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      <div className={styles.header__inner}>
        <div className={styles.header__left}>
          <button 
            className={`${styles.header__burger} ${isMobileMenuOpen ? styles.header__burger_open : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Меню"
          >
            <span className={styles.header__burgerLine}></span>
            <span className={styles.header__burgerLine}></span>
            <span className={styles.header__burgerLine}></span>
          </button>
        </div>
        
        <div className={styles.header__center}>
          <div className={styles.header__logo}>
            <Link to="/" className={styles.header__logoLink}>
              LOGO
            </Link>
          </div>
        </div>
        
        <div className={styles.header__right}>
          <Link to="/collections" className={styles.header__actionBtn} aria-label="Каталог">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </Link>
        </div>
      
        <DrawerMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
      </div>
    </header>
  );
};

export default Header; 