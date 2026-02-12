/**
 * Главный роутинг приложения.
 * Маршруты: / — главная, /catalog — каталог, /collections — коллекции,
 * /product/:uid — карточка товара, /cart — корзина, /admin/* — админка.
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Toast from './components/Toast/Toast';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CatalogPage from './pages/CatalogPage';
import CollectionsPage from './pages/CollectionsPage';
import CartPage from './pages/CartPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminNotificationPage from './pages/admin/AdminNotificationPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import './styles/globals.scss';

const ADMIN_TOKEN_KEY = 'mebel_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Toast />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:collectionName" element={<ProductPage />} />
            <Route path="/product/:uid" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/settings" element={<AdminNotificationPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
