import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminToken } from '../../App';
import { getNotificationSettings, saveNotificationSettings, type NotificationSettings } from '../../utils/api';
import AdminLayout from './AdminLayout';
import styles from './Admin.module.scss';

const AdminNotificationPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    telegramBotToken: '',
    telegramChatId: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = getAdminToken();

  useEffect(() => {
    if (!token) {
      navigate('/admin', { replace: true });
      return;
    }
    let cancelled = false;
    getNotificationSettings(token)
      .then((data) => { if (!cancelled) setSettings(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await saveNotificationSettings(settings, token);
      setMessage('Настройки сохранены');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!token) return null;

  return (
    <AdminLayout>
      <h1 className={styles.adminTitle}>Настройки уведомлений</h1>
      <p className={styles.adminDesc}>
        Уведомления о новых заказах отправляются в Telegram и на почту. Укажите токен и Chat ID бота для Telegram и email для получения писем (SMTP настраивается в .env на сервере).
      </p>
      {message && <p className={styles.successMsg}>{message}</p>}
      {error && <p className={styles.errorMsg}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>Загрузка…</p>
      ) : (
        <form className={styles.settingsForm} onSubmit={handleSubmit}>
          <div className={styles.settingsField}>
            <label>Telegram Bot Token</label>
            <input
              type="text"
              value={settings.telegramBotToken}
              onChange={(e) => setSettings((s) => ({ ...s, telegramBotToken: e.target.value }))}
              placeholder="123456:ABC-DEF..."
            />
          </div>
          <div className={styles.settingsField}>
            <label>Telegram Chat ID</label>
            <input
              type="text"
              value={settings.telegramChatId}
              onChange={(e) => setSettings((s) => ({ ...s, telegramChatId: e.target.value }))}
              placeholder="−1001234567890 или id пользователя"
            />
          </div>
          <div className={styles.settingsField}>
            <label>Email для уведомлений о заказах</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))}
              placeholder="email@example.com"
            />
            <span className={styles.settingsHint}>На этот адрес будут приходить письма о новых заказах. SMTP задаётся в .env на сервере.</span>
          </div>
          <button type="submit" className={styles.settingsSubmit} disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </form>
      )}
    </AdminLayout>
  );
};

export default AdminNotificationPage;
