import React, { Component, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Public Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { PaymentFailed } from './pages/PaymentFailed';
import { TrackOrder } from './pages/TrackOrder';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { DeliveryPolicy } from './pages/policies/DeliveryPolicy';
import { ReturnsPolicy } from './pages/policies/ReturnsPolicy';
import { WarrantyPolicy } from './pages/policies/WarrantyPolicy';
import { PrivacyPolicy } from './pages/policies/PrivacyPolicy';
import { Terms } from './pages/policies/Terms';
import { NotFound } from './pages/NotFound';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { RequireAdmin } from './components/admin/RequireAdmin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminStock } from './pages/admin/AdminStock';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminSQL } from './pages/admin/AdminSQL';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// React Error Boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Application render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-[#E2E8F0] p-8 rounded-2xl shadow-sm space-y-4">
            <h1 className="font-heading text-xl font-bold text-[#1E2A44]">Something went wrong</h1>
            <p className="text-xs text-[#64748B]">
              An unexpected error occurred while rendering this page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="px-5 py-2.5 bg-[#1E2A44] text-white text-xs font-semibold rounded-lg"
            >
              Reload Store
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Public Layout Wrapper
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-[#1E2A44] dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main key={location.pathname} className="flex-1 page-enter">
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Public Storefront Routes */}
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
                <Route path="/category/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
                <Route path="/product/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
                <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
                <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
                <Route path="/order-success/:orderRef" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
                <Route path="/payment-failed" element={<PublicLayout><PaymentFailed /></PublicLayout>} />
                <Route path="/track-order" element={<PublicLayout><TrackOrder /></PublicLayout>} />
                <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                <Route path="/delivery-policy" element={<PublicLayout><DeliveryPolicy /></PublicLayout>} />
                <Route path="/returns-policy" element={<PublicLayout><ReturnsPolicy /></PublicLayout>} />
                <Route path="/warranty" element={<PublicLayout><WarrantyPolicy /></PublicLayout>} />
                <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
                <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />

                {/* Secret Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminProducts />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/products/new"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminProductForm />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/products/:id/edit"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminProductForm />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminCategories />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminOrders />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/stock"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminStock />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminReviews />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/content"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminContent />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminSettings />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/sql"
                  element={
                    <RequireAdmin>
                      <AdminLayout>
                        <AdminSQL />
                      </AdminLayout>
                    </RequireAdmin>
                  }
                />

                {/* 404 Catch-All */}
                <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
