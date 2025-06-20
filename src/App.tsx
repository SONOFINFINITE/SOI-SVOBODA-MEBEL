import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import CollectionsPage from './pages/CollectionsPage';
import './styles/globals.scss';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:collectionName" element={<CatalogPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
