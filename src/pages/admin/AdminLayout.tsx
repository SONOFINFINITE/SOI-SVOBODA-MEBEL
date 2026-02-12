import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAdminToken, setAdminToken } from '../../App';
import styles from './Admin.module.scss';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getAdminToken();

  const handleLogout = () => {
    setAdminToken(null);
    navigate('/admin', { replace: true });
  };

  if (!token) return null;

  const nav = [
    { path: '/admin/orders', label: 'Заказы' },
    { path: '/admin/products', label: 'Товары' },
    { path: '/admin/settings', label: 'Настройки уведомлений' },
    { path: '/admin/users', label: 'Пользователи' },
  ];

  return (
    <div className={styles.adminPage}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarTitle}>Админ-панель</div>
        <nav className={styles.adminSidebarNav}>
          {nav.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={location.pathname === path ? styles.adminSidebarLinkActive : styles.adminSidebarLink}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button type="button" className={styles.adminSidebarLogout} onClick={handleLogout}>
          Выйти
        </button>
      </aside>
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
