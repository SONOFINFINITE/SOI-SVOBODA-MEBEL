import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminToken } from '../../App';
import { getOrders, updateOrderStatus } from '../../utils/api';
import type { Order, OrderStatus } from '../../types/cart';
import AdminLayout from './AdminLayout';
import styles from './Admin.module.scss';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новая',
  contacted: 'Связались',
  confirmed: 'Подтверждён',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const navigate = useNavigate();
  const token = getAdminToken();

  useEffect(() => {
    if (!token) {
      navigate('/admin', { replace: true });
      return;
    }
    let cancelled = false;
    getOrders(token)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Ошибка загрузки');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, navigate]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          (o.email && o.email.toLowerCase().includes(q)) ||
          (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(q)) ||
          (o.comment && o.comment.toLowerCase().includes(q)) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    if (statusFilter) {
      list = list.filter((o) => o.status === statusFilter);
    }
    return list;
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    try {
      const updated = await updateOrderStatus(orderId, status, token);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!token) return null;

  return (
    <AdminLayout>
      <h1 className={styles.adminTitle}>Заказы</h1>

      {!loading && (
        <div className={styles.adminFilters}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, телефону, email, адресу, комментарию, товару..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter((e.target.value || '') as OrderStatus | '')}
          >
            <option value="">Все статусы</option>
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            Показано: {filteredOrders.length} из {orders.length}
          </span>
        </div>
      )}

      {loading && <p className={styles.loading}>Загрузка…</p>}
      {error && <p className={styles.errorMsg}>{error}</p>}

      {!loading && !error && (
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Клиент</th>
              <th>Телефон</th>
              <th>Адрес доставки</th>
              <th>Товары</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  {orders.length === 0 ? 'Заказов пока нет' : 'Нет заказов по заданным фильтрам'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    {new Date(order.createdAt).toLocaleString('ru-RU', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td>
                    {order.customerName}
                    {order.email && ` (${order.email})`}
                  </td>
                  <td>{order.phone}</td>
                  <td className={styles.orderAddress}>
                    {order.deliveryAddress || '—'}
                  </td>
                  <td className={styles.orderItems}>
                    {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                    {order.comment && ` • ${order.comment}`}
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    >
                      {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
};

export default AdminOrdersPage;
