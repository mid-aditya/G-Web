import { useState } from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const components = [
  { name: 'Pixelate Image Render Effect', category: 'Effects' },
  { name: 'Directional List Hover', category: 'Interactions' },
  { name: 'Flick Cards Slider', category: 'Sliders' },
  { name: 'Face Follow Cursor (Mascot)', category: 'Animations' },
  { name: 'Locomotive Smooth Scroll Setup', category: 'Scroll' },
  { name: 'Logo Wall Cycle', category: 'Marquees' },
  { name: 'Falling 2D Objects (MatterJS)', category: 'Physics' },
  { name: '3D Image Carousel', category: '3D' },
  { name: 'Momentum Based Hover (Inertia)', category: 'Interactions' },
]

const testimonials = [
  {
    quote: "CodeIT transformed our business with intelligent automation",
    author: "Sarah Chen",
    role: "CTO, TechCorp",
    highlight: "Thanks to CodeIT's AI automation solutions, we've reduced manual work by 80% and scaled our operations effortlessly."
  },
  {
    quote: "The best web development partner we've worked with.",
    author: "Michael Rodriguez",
    role: "Founder, StartupHub",
    highlight: "CodeIT delivered a stunning web application that exceeded our expectations. Their expertise in modern tech is unmatched."
  },
  {
    quote: "Their AI solutions are game-changing for our industry.",
    author: "Emily Watson",
    role: "Operations Director",
    highlight: "CodeIT's automation tools have revolutionized how we handle data processing and customer interactions."
  },
  {
    quote: "From concept to deployment, CodeIT made it seamless.",
    author: "David Kim",
    role: "Product Manager",
    highlight: "CodeIT is a one-stop solution, offering everything from custom web apps to advanced AI automation that drives real results."
  }
]

interface HomeProps {
  onLogin: () => void
  onRegister: () => void
  onLogoClick?: () => void
}

interface FAQItemProps {
  question: string
  answer: string
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button 
        className="faq-question"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <svg 
          className="faq-icon"
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d={isOpen ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
        </svg>
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}

const Home = ({ onLogin, onRegister, onLogoClick }: HomeProps) => {
  return (
    <div className="app">
      <Navbar 
        onLogin={onLogin}
        onRegister={onRegister}
        onLogoClick={onLogoClick}
      />

      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '10rem' }}>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line">Web • App • AI</span>
            </h1>
            <h2 className="hero-subtitle">
              <span className="subtitle-line">Automation Solutions</span>
            </h2>
            <p className="hero-description">
              We build cutting-edge web applications, mobile apps, and AI-powered automation systems that transform businesses
            </p>
          </div>

          <div className="hero-video">
            <div className="video-placeholder">
              <div className="play-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p>CodeIT in action</p>
              <span className="video-duration">00:48</span>
            </div>
          </div>

          <div className="hero-cta">
            <button className="btn-primary">Start Your Project</button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <div className="pricing-container">
          <h2 className="section-title">Pricing for Individuals</h2>
          <p className="section-subtitle">Choose the plan that fits you best.</p>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <span className="pricing-badge">our base plan</span>
                <h3 className="pricing-title">Member</h3>
                <div className="pricing-price">
                  <span className="price-amount">€25</span>
                  <span className="price-period">per month</span>
                </div>
              </div>
              <p className="pricing-description">
                Perfect for startups and small businesses looking to establish their digital presence.
              </p>
              <ul className="pricing-features">
                <li>Custom web application development</li>
                <li>Responsive mobile app design</li>
                <li>Basic AI automation setup</li>
                <li>3 months of support & updates</li>
              </ul>
              <button className="btn-pricing">Get Started</button>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-header">
                <span className="pricing-badge">Pay Once, Use Forever</span>
                <h3 className="pricing-title">Lifetime</h3>
                <div className="pricing-price">
                  <span className="price-amount">€599</span>
                  <span className="price-period">one time</span>
                </div>
              </div>
              <p className="pricing-description">
                Comprehensive solution for enterprises. Full-stack development with advanced AI automation and ongoing support.
              </p>
              <ul className="pricing-features">
                <li>Full-stack web & mobile development</li>
                <li>Advanced AI automation systems</li>
                <li>Priority support & maintenance</li>
                <li>Custom integrations & scaling</li>
              </ul>
              <button className="btn-pricing primary">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="showcase" id="showcase">
        <div className="showcase-container">
          <div className="showcase-header">
            <h2 className="section-title showcase-title">
              CodeIT is a leading company specializing in web development, mobile applications, and AI automation solutions. 
              We transform ideas into powerful digital experiences that drive business growth.
            </h2>
          </div>

          <div className="components-grid">
            {components.map((component, index) => (
              <div key={index} className="component-card">
                <div className="card-content">
                  <span className="card-category">{component.category}</span>
                  <h3 className="card-title">{component.name}</h3>
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

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="testimonials-container">
          <h2 className="section-title">Trusted by Industry Giants</h2>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <div className="testimonial-author">
                  <h4>{testimonial.author}</h4>
                  <p className="author-role">{testimonial.role}</p>
                </div>
                <p className="testimonial-highlight">{testimonial.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq" id="faq">
        <div className="faq-container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Everything you need to know about our services.</p>

          <div className="faq-list">
            <FAQItem 
              question="What services does CodeIT offer?"
              answer="CodeIT specializes in web development, mobile app creation, and AI automation solutions. We provide end-to-end services from design to deployment, including custom web applications, responsive mobile apps, and intelligent automation systems that streamline business processes."
            />
            <FAQItem 
              question="How long does a typical project take?"
              answer="Project timelines vary based on complexity. A simple web application typically takes 4-8 weeks, while comprehensive solutions with AI automation can take 12-16 weeks. We provide detailed timelines during the initial consultation based on your specific requirements."
            />
            <FAQItem 
              question="Do you provide ongoing support and maintenance?"
              answer="Yes, all our plans include support and maintenance. The Member plan includes 3 months of support, while the Lifetime plan includes ongoing priority support and maintenance. We also offer dedicated support packages for enterprise clients."
            />
            <FAQItem 
              question="Can I upgrade or change my plan later?"
              answer="Absolutely! You can upgrade from Member to Lifetime at any time. We'll prorate the cost based on your remaining subscription period. You can also add additional services or features to your existing plan as your needs grow."
            />
            <FAQItem 
              question="What technologies do you use?"
              answer="We use modern, industry-standard technologies including React, Next.js, Node.js, Python, and various AI/ML frameworks. Our mobile apps are built with React Native and Flutter. We stay current with the latest technologies to ensure your solutions are future-proof."
            />
            <FAQItem 
              question="Do you work with international clients?"
              answer="Yes! We work with clients worldwide. Our team is distributed and we're experienced in working across different time zones. We offer flexible communication channels and can accommodate various project requirements and cultural considerations."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
