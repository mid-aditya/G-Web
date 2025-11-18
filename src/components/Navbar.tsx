import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { GoArrowUpRight } from 'react-icons/go'
import { HiSun, HiMoon } from 'react-icons/hi'
import { useTheme } from '../contexts/ThemeContext'
import './Navbar.css'

interface NavbarProps {
  onLogin: () => void
  onRegister: () => void
  onLogoClick?: () => void
}

const Navbar = ({ onLogin, onRegister, onLogoClick }: NavbarProps) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    {
      label: 'Navigation',
      bgColor: '#0D0716',
      textColor: '#fff',
      links: [
        { label: 'Home', href: '/', ariaLabel: 'Go to home page' },
        { label: 'Showcase', href: '/showcase', ariaLabel: 'Go to showcase page' },
        { label: 'Blog', href: '/blog', ariaLabel: 'Go to blog page' },
      ]
    },
    {
      label: 'Showcase',
      bgColor: '#170D27',
      textColor: '#fff',
      links: [
        { label: 'View All Components', href: '/showcase', ariaLabel: 'View all components' },
        { label: 'Effects', href: '/showcase#effects', ariaLabel: 'View effects' },
        { label: 'Animations', href: '/showcase#animations', ariaLabel: 'View animations' },
      ]
    },
    {
      label: 'Blog',
      bgColor: '#271E37',
      textColor: '#fff',
      links: [
        { label: 'Latest Posts', href: '/blog', ariaLabel: 'View latest blog posts' },
        { label: 'Tutorials', href: '/blog#tutorials', ariaLabel: 'View tutorials' },
        { label: 'Updates', href: '/blog#updates', ariaLabel: 'View updates' },
      ]
    }
  ]

  const calculateHeight = () => {
    const navEl = navRef.current
    if (!navEl) return 260

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement
      if (contentEl) {
        const wasVisible = contentEl.style.visibility
        const wasPointerEvents = contentEl.style.pointerEvents
        const wasPosition = contentEl.style.position
        const wasHeight = contentEl.style.height

        contentEl.style.visibility = 'visible'
        contentEl.style.pointerEvents = 'auto'
        contentEl.style.position = 'static'
        contentEl.style.height = 'auto'
        contentEl.offsetHeight

        const topBar = 60
        const padding = 16
        const contentHeight = contentEl.scrollHeight

        contentEl.style.visibility = wasVisible
        contentEl.style.pointerEvents = wasPointerEvents
        contentEl.style.position = wasPosition
        contentEl.style.height = wasHeight

        return topBar + contentHeight + padding
      }
    }
    return 260
  }

  const createTimeline = () => {
    const navEl = navRef.current
    if (!navEl) return null

    const cards = cardsRef.current.filter(Boolean) as HTMLElement[]
    if (cards.length === 0) {
      return null
    }

    // Set initial state
    gsap.set(navEl, { height: 60, overflow: 'hidden' })
    gsap.set(cards, { y: 50, opacity: 0 })

    const tl = gsap.timeline({ paused: true })
    
    // Animate height first
    tl.to(navEl, {
      height: calculateHeight(),
      duration: 0.4,
      ease: 'power3.out',
      onStart: () => {
        // Make content visible when animation starts
        const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement
        if (contentEl) {
          contentEl.style.visibility = 'visible'
          contentEl.style.pointerEvents = 'auto'
        }
      }
    })
    
    // Animate cards
    tl.to(cards, { 
      y: 0, 
      opacity: 1, 
      duration: 0.4, 
      ease: 'power3.out', 
      stagger: 0.08 
    }, '-=0.1')

    return tl
  }

  useLayoutEffect(() => {
    // Create timeline after cards are rendered
    const initTimeline = () => {
      const cards = cardsRef.current.filter(Boolean)
      if (cards.length === navItems.length) {
        const tl = createTimeline()
        if (tl) {
          if (tlRef.current) {
            tlRef.current.kill()
          }
          tlRef.current = tl
        }
        return true
      }
      return false
    }
    
    // Try multiple times to ensure cards are rendered
    let attempts = 0
    const maxAttempts = 10
    
    const tryInit = () => {
      attempts++
      if (initTimeline() || attempts >= maxAttempts) {
        return
      }
      setTimeout(tryInit, 50)
    }
    
    const timer = setTimeout(tryInit, 50)
    
    return () => {
      clearTimeout(timer)
      if (tlRef.current) {
        tlRef.current.kill()
        tlRef.current = null
      }
    }
  }, [])

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return
      if (isExpanded) {
        const newHeight = calculateHeight()
        gsap.set(navRef.current, { height: newHeight })
        tlRef.current.kill()
        const newTl = createTimeline()
        if (newTl) {
          newTl.progress(1)
          tlRef.current = newTl
        }
      } else {
        tlRef.current.kill()
        const newTl = createTimeline()
        if (newTl) {
          tlRef.current = newTl
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isExpanded])

  const toggleMenu = () => {
    if (!isExpanded) {
      setIsHamburgerOpen(true)
      setIsExpanded(true)
      
      // Wait for state update and DOM render
      setTimeout(() => {
        // Ensure timeline is created and ready
        let tl = tlRef.current
        if (!tl) {
          tl = createTimeline()
          if (tl) {
            tlRef.current = tl
          }
        }
        
        if (tl) {
          // Reset timeline to start and play
          tl.progress(0)
          tl.play()
        }
      }, 0)
    } else {
      setIsHamburgerOpen(false)
      const tl = tlRef.current
      if (tl) {
        tl.eventCallback('onReverseComplete', () => {
          setIsExpanded(false)
          // Hide content after reverse
          const navEl = navRef.current
          if (navEl) {
            const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement
            if (contentEl) {
              contentEl.style.visibility = 'hidden'
              contentEl.style.pointerEvents = 'none'
            }
          }
        })
        tl.reverse()
      } else {
        setIsExpanded(false)
      }
    }
  }

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) {
      cardsRef.current[i] = el
    } else {
      cardsRef.current[i] = null
    }
  }

  const handleLogoClick = () => {
    navigate('/')
    if (onLogoClick) onLogoClick()
  }

  const handleLinkClick = (link: any, e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault()
      link.onClick()
    }
    if (isExpanded) {
      toggleMenu()
    }
  }

  return (
    <div className="card-nav-container">
      <nav 
        ref={navRef} 
        className={`card-nav ${isExpanded ? 'open' : ''}`}
      >
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container" onClick={handleLogoClick}>
            <span className="logo-text">Gadit</span>
          </div>

          <div className="card-nav-top-actions">
            <button
              type="button"
              className="theme-toggle-button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <HiSun /> : <HiMoon />}
            </button>
            <button
              type="button"
              className="card-nav-login-button"
              onClick={onLogin}
            >
              Login
            </button>
            <button
              type="button"
              className="card-nav-cta-button"
              onClick={onRegister}
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {navItems.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => {
                  if (lnk.onClick) {
                    return (
                      <button
                        key={`${lnk.label}-${i}`}
                        className="nav-card-link"
                        onClick={(e) => {
                          e.preventDefault()
                          handleLinkClick(lnk, e)
                        }}
                        aria-label={lnk.ariaLabel}
                      >
                        <GoArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                        {lnk.label}
                      </button>
                    )
                  }
                  return (
                    <Link
                      key={`${lnk.label}-${i}`}
                      className="nav-card-link"
                      to={lnk.href}
                      onClick={(e) => handleLinkClick(lnk, e)}
                      aria-label={lnk.ariaLabel}
                    >
                      <GoArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                      {lnk.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default Navbar