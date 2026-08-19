import { useEffect } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import { useCartStore } from './stores/cartStore'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Account from './pages/Account'
import Orders from './pages/Orders'
import Admin from './pages/Admin'
import Login from './auth/Login'
import Register from './auth/Register'
import NotFound from './pages/404'
import './App.css'

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
