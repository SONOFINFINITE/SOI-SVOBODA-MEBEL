import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminToken } from '../../App';
import { getAdminUsers, createAdminUser, resetAdminPassword } from '../../utils/api';
import AdminLayout from './AdminLayout';
import styles from './Admin.module.scss';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<{ login: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetLogin, setResetLogin] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();
  const token = getAdminToken();

  useEffect(() => {
    if (!token) {
      navigate('/admin', { replace: true });
      return;
    }
    let cancelled = false;
    getAdminUsers(token)
      .then((data) => { if (!cancelled) setUsers(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, navigate]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setMessage('');
    const login = newLogin.trim();
    const password = newPassword;
    if (!login || !password) {
      setError('Укажите логин и пароль');
      return;
    }
    if (password.length < 6) {
      setError('Пароль не менее 6 символов');
      return;
    }
    setSaving(true);
    try {
      const updated = await createAdminUser(login, password, token);
      setUsers(updated);
      setNewLogin('');
      setNewPassword('');
      setMessage('Пользователь добавлен');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !resetLogin) return;
    const newPass = resetPassword.trim();
    if (newPass.length < 6) {
      setError('Пароль не менее 6 символов');
      return;
    }
    setError('');
    setMessage('');
    setResetting(true);
    try {
      await resetAdminPassword(resetLogin, newPass, token);
      setResetLogin(null);
      setResetPassword('');
      setMessage('Пароль обновлён');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResetting(false);
    }
  };

  const openReset = (login: string) => {
    setResetLogin(login);
    setResetPassword('');
    setError('');
    setMessage('');
  };

  if (!token) return null;

  return (
    <AdminLayout>
      <h1 className={styles.adminTitle}>Пользователи админки</h1>
      <p className={styles.adminDesc}>
        Список администраторов. Любой из них может войти в админ-панель и добавлять новых пользователей.
      </p>
      {message && <p className={styles.successMsg}>{message}</p>}
      {error && <p className={styles.errorMsg}>{error}</p>}

      {loading ? (
        <p className={styles.loading}>Загрузка…</p>
      ) : (
        <>
          <ul className={styles.usersList}>
            {users.map((u) => (
              <li key={u.login} className={styles.userItem}>
                <span>{u.login}</span>
                <button
                  type="button"
                  className={styles.userResetBtn}
                  onClick={() => openReset(u.login)}
                >
                  Сбросить пароль
                </button>
              </li>
            ))}
          </ul>

          {resetLogin && (
            <form
              className={styles.settingsForm}
              onSubmit={handleResetPassword}
              style={{ marginTop: '1.5rem' }}
            >
              <h2 className={styles.formTitle}>Новый пароль для {resetLogin}</h2>
              <div className={styles.settingsField}>
                <label>Новый пароль (не менее 6 символов)</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="submit" className={styles.settingsSubmit} disabled={resetting}>
                  {resetting ? 'Сохранение…' : 'Сохранить пароль'}
                </button>
                <button
                  type="button"
                  className={styles.userCancelBtn}
                  onClick={() => { setResetLogin(null); setResetPassword(''); setError(''); }}
                >
                  Отмена
                </button>
              </div>
            </form>
          )}

          <form className={styles.settingsForm} onSubmit={handleAdd} style={{ marginTop: '2rem' }}>
            <h2 className={styles.formTitle}>Добавить администратора</h2>
            <div className={styles.settingsField}>
              <label>Логин (email)</label>
              <input
                type="text"
                value={newLogin}
                onChange={(e) => setNewLogin(e.target.value)}
                placeholder="email@example.com"
                autoComplete="off"
              />
            </div>
            <div className={styles.settingsField}>
              <label>Пароль (не менее 6 символов)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className={styles.settingsSubmit} disabled={saving}>
              {saving ? 'Сохранение…' : 'Добавить'}
            </button>
          </form>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage;
