import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import AuthModal from './components/AuthModal';
import CompareModal from './components/CompareModal';

import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CategoriesPage from './pages/CategoriesPage';
import DealsPage from './pages/DealsPage';
import AiRecommendationsPage from './pages/AiRecommendationsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import StaticPage from './pages/StaticPage';
import NotFound from './pages/NotFound';

import { useStore } from './context/StoreContext';

function App() {
  const { toast, theme } = useStore();

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <Navbar />

      <main className="main-content" aria-live="polite">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/products" element={<ProductsPage />} />

          <Route path="/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/products/:productId" element={<ProductDetailsPage />} />

          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryName" element={<ProductsPage />} />

          <Route path="/deals" element={<DealsPage />} />
          <Route path="/offers" element={<DealsPage />} />

          <Route path="/ai-recommendations" element={<AiRecommendationsPage />} />
          <Route path="/ai-assistant" element={<AiRecommendationsPage />} />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<CheckoutPage step="payment" />} />

          <Route path="/track-order" element={<OrderTrackingPage />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<DashboardPage initialTab="settings" />} />
          <Route path="/orders" element={<DashboardPage initialTab="orders" />} />
          <Route path="/wishlist" element={<DashboardPage initialTab="wishlist" />} />
          <Route path="/addresses" element={<DashboardPage initialTab="addresses" />} />
          <Route path="/notifications" element={<DashboardPage initialTab="notifications" />} />

          <Route path="/admin" element={<AdminPage />} />

          <Route path="/about" element={<StaticPage type="about" />} />
          <Route path="/contact" element={<StaticPage type="contact" />} />
          <Route path="/faq" element={<StaticPage type="faq" />} />
          <Route path="/reviews" element={<StaticPage type="reviews" />} />

          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      <AuthModal />
      <CompareModal />
      <Chatbot floating />

      {toast && (
        <div className={`toast toast-${toast.type || 'info'}`}>
          <div className="toast-icon">
            {toast.type === 'error' ? '!' : toast.type === 'info' ? 'i' : '✓'}
          </div>
          <p className="toast-message">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

export default App;