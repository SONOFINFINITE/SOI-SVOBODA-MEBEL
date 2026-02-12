import React, { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './Toast.module.scss';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useCart();

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(clearToast, 3000);
    return () => clearTimeout(t);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.toastIcon}>✓</span>
      {toastMessage}
    </div>
  );
};

export default Toast;
