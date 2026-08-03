import { useEffect } from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const components = [
  { name: 'Pixelate Image Render Effect', category: 'Effects', description: 'Advanced image processing with pixelation effects' },
  { name: 'Directional List Hover', category: 'Interactions', description: 'Smooth directional hover animations for lists' },
  { name: 'Flick Cards Slider', category: 'Sliders', description: 'Interactive card slider with flick gestures' },
  { name: 'Face Follow Cursor (Mascot)', category: 'Animations', description: 'Animated mascot that follows cursor movement' },
  { name: 'Locomotive Smooth Scroll Setup', category: 'Scroll', description: 'Butter-smooth scrolling experience' },
  { name: 'Logo Wall Cycle', category: 'Marquees', description: 'Continuous logo marquee animation' },
  { name: 'Falling 2D Objects (MatterJS)', category: 'Physics', description: 'Physics-based falling objects simulation' },
  { name: '3D Image Carousel', category: '3D', description: 'Immersive 3D carousel with depth effects' },
  { name: 'Momentum Based Hover (Inertia)', category: 'Interactions', description: 'Momentum-based hover with inertia physics' },
]

interface ShowcaseProps {
  onLogin: () => void
  onRegister: () => void
  onLogoClick?: () => void
}

const Showcase = ({ onLogin, onRegister, onLogoClick }: ShowcaseProps) => {
  useEffect(() => {
    document.title = 'Component Showcase - CodeIT'
  }, [])

  return (
    <div className="app">
      <Navbar 
        onLogin={onLogin}
        onRegister={onRegister}
        onLogoClick={onLogoClick}
      />

      <section className="showcase" style={{ paddingTop: '8rem' }}>
        <div className="showcase-container">
          <div className="showcase-header">
            <h1 className="section-title showcase-title">
              Component Showcase
            </h1>
            <p className="section-subtitle">
              Explore our collection of premium components and animations built for modern web experiences
            </p>
          </div>

          <div className="components-grid">
            {components.map((component, index) => (
              <div key={index} className="component-card">
                <div className="card-content">
                  <span className="card-category">{component.category}</span>
                  <h3 className="card-title">{component.name}</h3>
                  <p className="card-description">{component.description}</p>
                </div>
                <div className="card-hover-effect"></div>
              </div>
            ))}
          </div>

          <div className="showcase-info">
            <p className="member-count">500+ Successful Projects</p>
            <div className="creators">
              <p>Powered by</p>
              <div className="creator-names">
                <span>CodeIT Team</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Showcase
