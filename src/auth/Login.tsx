import { useEffect, useRef, useState } from 'react'
import '../App.css'

interface LoginProps {
  onClose: () => void
  onSwitchToRegister: () => void
}

const Login = ({ onClose, onSwitchToRegister }: LoginProps) => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [facePos, setFacePos] = useState({ x: 0, y: 0 })
  const pageRef = useRef<HTMLDivElement>(null)
  const faceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useEffect(() => {
    if (!pageRef.current || !faceRef.current) return

    const pageRect = pageRef.current.getBoundingClientRect()
    const pageCenterX = pageRect.left + pageRect.width / 2
    const pageCenterY = pageRect.top + pageRect.height / 2

    const deltaX = cursorPos.x - pageCenterX
    const deltaY = cursorPos.y - pageCenterY
    const maxDistance = 100

    const moveX = Math.min(deltaX * 0.15, maxDistance)
    const moveY = Math.min(deltaY * 0.15, maxDistance)

    setFacePos({ x: moveX, y: moveY })
  }, [cursorPos])

  return (
    <div className="app">
      <div className="auth-page" ref={pageRef}>
        <button className="auth-close" onClick={onClose}>×</button>
        
        {/* Face Follow Cursor */}
        <div 
          className="face-mascot" 
          ref={faceRef}
          style={{
            transform: `translate(${facePos.x}px, ${facePos.y}px)`
          }}
        >
          <div className="face">
            <div className="face-eyes">
              <div className="eye">
                <div className="pupil" style={{
                  transform: `translate(${facePos.x * 0.3}px, ${facePos.y * 0.3}px)`
                }}></div>
              </div>
              <div className="eye">
                <div className="pupil" style={{
                  transform: `translate(${facePos.x * 0.3}px, ${facePos.y * 0.3}px)`
                }}></div>
              </div>
            </div>
            <div className="face-mouth"></div>
          </div>
        </div>

        <div className="auth-body">
          <h2 className="auth-title">Welcome Back!</h2>
          <p className="auth-subtitle">Sign in to continue</p>

          <form className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" />
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="forgot-link">Forgot password?</a>
            </div>
            <button type="submit" className="btn-submit">Sign In</button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <button 
                className="link-button"
                onClick={onSwitchToRegister}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
