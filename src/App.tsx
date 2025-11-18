import { useState } from 'react'
import { Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import Login from './auth/Login'
import Register from './auth/Register'
import NotFound from './pages/404'
import Blog from './pages/Blog'
import Home from './pages/Home'
import Showcase from './pages/Showcase'

function AppContent() {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const navigate = useNavigate()

  const openLogin = () => {
    setShowLogin(true)
    setShowRegister(false)
    document.body.style.overflow = 'hidden'
  }

  const openRegister = () => {
    setShowRegister(true)
    setShowLogin(false)
    document.body.style.overflow = 'hidden'
  }

  const closeAuth = () => {
    setShowLogin(false)
    setShowRegister(false)
    document.body.style.overflow = 'unset'
  }

  const switchToRegister = () => {
    setShowLogin(false)
    setShowRegister(true)
  }

  const switchToLogin = () => {
    setShowRegister(false)
    setShowLogin(true)
  }

  const handleLogoClick = () => {
    navigate('/')
    setShowLogin(false)
    setShowRegister(false)
    document.body.style.overflow = 'unset'
  }

  // Show login full page if active
  if (showLogin) {
    return (
      <Login 
        onClose={closeAuth}
        onSwitchToRegister={switchToRegister}
      />
    )
  }

  // Show register full page if active
  if (showRegister) {
    return (
      <Register 
        onClose={closeAuth}
        onSwitchToLogin={switchToLogin}
      />
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home onLogin={openLogin} onRegister={openRegister} onLogoClick={handleLogoClick} />} />
      <Route path="/showcase" element={<Showcase onLogin={openLogin} onRegister={openRegister} onLogoClick={handleLogoClick} />} />
      <Route path="/blog" element={<Blog onLogin={openLogin} onRegister={openRegister} onLogoClick={handleLogoClick} />} />
      <Route path="*" element={<NotFound onLogin={openLogin} onRegister={openRegister} onLogoClick={handleLogoClick} />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App