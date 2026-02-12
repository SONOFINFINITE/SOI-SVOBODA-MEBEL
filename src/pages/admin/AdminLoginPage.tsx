import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../utils/api';
import { getAdminToken, setAdminToken } from '../../App';
import styles from './Admin.module.scss';

const AdminLoginPage: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getAdminToken()) navigate('/admin/orders', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await adminLogin(login.trim(), password);
    setLoading(false);
    if (result.success && result.token) {
      setAdminToken(result.token);
      navigate('/admin/orders', { replace: true });
    } else {
      setError(result.error || 'Ошибка входа');
    }
  };

  return (
    <div className={`${styles.adminPage} ${styles.loginOnly}`}>
      <div className={styles.loginBox}>
        <h1>Вход в админ-панель</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин"
            autoComplete="username"
            autoFocus
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoComplete="current-password"
            disabled={loading}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Вход…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
