/**
 * Корзина и оформление заказа. Заказ уходит в submitOrder (backend).
 * Адрес доставки обязателен. Данные в backend/data/orders.json.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Header from '../components/Header/Header';
import { Footer } from '../components/Footer/footer';
import { useCart } from '../context/CartContext';
import { submitOrder } from '../utils/api';
import { usePageMeta } from '../utils/seo';
import styles from './CartPage.module.scss';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, totalSum, totalCount, clearCart } = useCart();
  const navigate = useNavigate();
  usePageMeta('Корзина', 'Оформление заказа мебели СВОБОДА. Укажите контакты и адрес доставки — менеджер свяжется для подтверждения.');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (items.length === 0) {
      setError('Корзина пуста');
      return;
    }
    if (!customerName.trim()) {
      setError('Укажите имя');
      return;
    }
    if (!phone.trim()) {
      setError('Укажите телефон');
      return;
    }
    if (!deliveryAddress.trim()) {
      setError('Укажите адрес доставки');
      return;
    }
    setSubmitting(true);
    const result = await submitOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      deliveryAddress: deliveryAddress.trim(),
      comment: comment.trim() || undefined,
      items,
    });
    setSubmitting(false);
    if (result.success) {
      setOrderSent(true);
      clearCart();
    } else {
      setError(result.error || 'Не удалось отправить заявку');
    }
  };

  const formatSum = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/catalog');
  };

  if (orderSent) {
    return (
      <div className={styles.cartPage}>
        <Header />
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="Назад">
              <ArrowLeft size={18} />
            </button>
            <h1 className={styles.title}>Корзина</h1>
          </div>
          <div className={styles.successBlock}>
            <h3>Заявка отправлена</h3>
            <p>Менеджер свяжется с вами для подтверждения заказа.</p>
            <Link to="/catalog">Вернуться в каталог</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <Header />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="Назад">
            <ArrowLeft size={18} />
          </button>
          <h1 className={styles.title}>Корзина</h1>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>В корзине пока ничего нет.</p>
            <Link to="/catalog">Перейти в каталог</Link>
          </div>
        ) : (
          <>
            <ul className={styles.itemsList}>
              {items.map((item) => (
                <li key={item.productUid} className={styles.item}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemPrice}>{item.price}</div>
                  </div>
                  <div className={styles.itemControls}>
                    <div className={styles.itemQty}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productUid, item.quantity - 1)}
                        aria-label="Уменьшить"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productUid, item.quantity + 1)}
                        aria-label="Увеличить"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className={styles.itemRemove}
                      onClick={() => removeItem(item.productUid)}
                      aria-label="Удалить"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Итого ({totalCount}):</span>
              <span className={styles.totalSum}>{formatSum(totalSum)}</span>
            </div>

            <form className={styles.formSection} onSubmit={handleSubmit}>
              <h2 className={styles.formTitle}>Оформление заявки</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Оставьте контакты — менеджер свяжется для подтверждения заказа.
              </p>
              <div className={styles.formGrid}>
                <div className={`${styles.formField} ${styles.half}`}>
                  <label>Имя *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ваше имя"
                    required
                  />
                </div>
                <div className={`${styles.formField} ${styles.half}`}>
                  <label>Телефон *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    required
                  />
                </div>
                <div className={`${styles.formField} ${styles.half}`}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className={styles.formField}>
                  <label>Адрес доставки *</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Город, улица, дом, квартира"
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label>Комментарий</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Пожелания к заказу"
                  />
                </div>
              </div>
              {error && <p className={styles.errorMsg}>{error}</p>}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? 'Отправка…' : 'Отправить заявку'}
              </button>
            </form>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
