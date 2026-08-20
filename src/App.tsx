import { lazy, Suspense, useEffect } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import { useCartStore } from './stores/cartStore'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

// Lazy loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Catalog = lazy(() => import('./pages/Catalog'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Account = lazy(() => import('./pages/Account'))
const Orders = lazy(() => import('./pages/Orders'))
const Admin = lazy(() => import('./pages/Admin'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Login = lazy(() => import('./auth/Login'))
const Register = lazy(() => import('./auth/Register'))
const NotFound = lazy(() => import('./pages/404'))

const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    fontFamily: 'inherit',
  }}>
    <div className="loading-spinner" />
  </div>
)

function App() {
  const { fetchUser, isAuthenticated } = useAuthStore()
  const { fetchCart } = useCartStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a18',
                color: '#fafaf8',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              },
            }}
          />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/account" element={<Account />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App
