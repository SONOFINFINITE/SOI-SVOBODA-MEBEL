import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CatalogPage from './pages/CatalogPage';
import CollectionsPage from './pages/CollectionsPage';
import './styles/globals.scss';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:collectionName" element={<ProductPage />} />
          <Route path="/product/:uid" element={<ProductPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
