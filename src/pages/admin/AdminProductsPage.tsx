import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { products as localProducts, combineProducts } from '../../data/catalog';
import { getAdminToken } from '../../App';
import { getProductOverrides, saveProductOverrides, fetchXmlProducts, type ProductOverrides } from '../../utils/api';
import AdminLayout from './AdminLayout';
import styles from './Admin.module.scss';

const AdminProductsPage: React.FC = () => {
  const [overrides, setOverrides] = useState<ProductOverrides>({});
  const [xmlProducts, setXmlProducts] = useState<typeof localProducts>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = getAdminToken();

  const products = useMemo(() => combineProducts(localProducts, xmlProducts), [xmlProducts]);

  useEffect(() => {
    if (!token) {
      navigate('/admin', { replace: true });
      return;
    }
    let cancelled = false;
    Promise.all([
      getProductOverrides(token),
      fetchXmlProducts(),
    ])
      .then(([overridesData, xml]) => {
        if (!cancelled) {
          setOverrides(overridesData);
          setXmlProducts(xml);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Ошибка загрузки');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, navigate]);

  const handleOverride = (uid: string, field: 'name' | 'price' | 'image' | 'salePrice', value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [uid]: { ...prev[uid], [field]: value || undefined },
    }));
  };

  const handleSaleToggle = (uid: string, checked: boolean) => {
    setOverrides((prev) => {
      const next = { ...prev, [uid]: { ...prev[uid], isSale: checked } };
      if (!checked) delete next[uid].salePrice;
      return next;
    });
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await saveProductOverrides(overrides, token);
      setMessage('Правки сохранены');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!token) return null;

  return (
    <AdminLayout>
      <h1 className={styles.adminTitle}>Редактирование товаров</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Локальные товары и товары из XML-выгрузки. Можно задать акционную цену и пометить «Акция».
        </p>

        {message && <p style={{ color: '#9e9', marginBottom: '1rem' }}>{message}</p>}
        {error && <p className={styles.errorMsg}>{error}</p>}

        {!loading && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={styles.adminTitle}
                style={{ fontSize: '1rem', marginBottom: 0 }}
              >
                {saving ? 'Сохранение…' : 'Сохранить правки'}
              </button>
            </div>

            <div className={styles.productsSection}>
              <table className={styles.productsTable}>
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>Название</th>
                    <th>Цена</th>
                    <th>Картинка</th>
                    <th>Акция</th>
                    <th>Акц. цена</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const uid = product.uid || `${product.collection}-${product.id}`;
                    const name = overrides[uid]?.name ?? product.name;
                    const price = overrides[uid]?.price ?? product.price;
                    const image = overrides[uid]?.image ?? product.image;
                    const isSale = !!overrides[uid]?.isSale;
                    const salePrice = overrides[uid]?.salePrice ?? '';
                    return (
                      <tr key={uid}>
                        <td style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{uid}</td>
                        <td>
                          <input
                            value={name}
                            onChange={(e) => handleOverride(uid, 'name', e.target.value)}
                            placeholder="Название"
                          />
                        </td>
                        <td>
                          <input
                            value={price}
                            onChange={(e) => handleOverride(uid, 'price', e.target.value)}
                            placeholder="Цена"
                          />
                        </td>
                        <td>
                          <input
                            value={image}
                            onChange={(e) => handleOverride(uid, 'image', e.target.value)}
                            placeholder="URL картинки"
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={isSale}
                            onChange={(e) => handleSaleToggle(uid, e.target.checked)}
                            aria-label="Акция"
                          />
                        </td>
                        <td>
                          <input
                            value={salePrice}
                            onChange={(e) => handleOverride(uid, 'salePrice', e.target.value)}
                            placeholder="38 000 ₽"
                            disabled={!isSale}
                            style={{ opacity: isSale ? 1 : 0.5 }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {loading && <p className={styles.loading}>Загрузка…</p>}
    </AdminLayout>
  );
};

export default AdminProductsPage;
