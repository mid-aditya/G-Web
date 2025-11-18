import { useEffect } from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

interface BlogProps {
  onLogin: () => void
  onRegister: () => void
  onLogoClick?: () => void
}

const Blog = ({ onLogin, onRegister, onLogoClick }: BlogProps) => {
  useEffect(() => {
    // SEO Meta Tags
    document.title = 'Blog - Gadit | Web Development, Mobile Apps & AI Automation Insights'
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', 'Read the latest articles, tutorials, and insights about web development, mobile app creation, and AI automation from the Gadit team. Stay updated with industry trends and best practices.')
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.setAttribute('name', 'keywords')
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.setAttribute('content', 'web development, mobile apps, AI automation, React, Next.js, tutorials, blog, tech insights, software development')
    
    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
    if (!ogTitle.getAttribute('property')) ogTitle.setAttribute('property', 'og:title')
    ogTitle.setAttribute('content', 'Blog - Gadit | Web Development & AI Automation Insights')
    if (!document.querySelector('meta[property="og:title"]')) document.head.appendChild(ogTitle)
    
    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
    if (!ogDescription.getAttribute('property')) ogDescription.setAttribute('property', 'og:description')
    ogDescription.setAttribute('content', 'Latest updates, tutorials, and insights from the Gadit team about web development, mobile apps, and AI automation.')
    if (!document.querySelector('meta[property="og:description"]')) document.head.appendChild(ogDescription)
    
    const ogType = document.querySelector('meta[property="og:type"]') || document.createElement('meta')
    if (!ogType.getAttribute('property')) ogType.setAttribute('property', 'og:type')
    ogType.setAttribute('content', 'website')
    if (!document.querySelector('meta[property="og:type"]')) document.head.appendChild(ogType)
    
    // Twitter Card tags
    const twitterCard = document.querySelector('meta[name="twitter:card"]') || document.createElement('meta')
    if (!twitterCard.getAttribute('name')) twitterCard.setAttribute('name', 'twitter:card')
    twitterCard.setAttribute('content', 'summary_large_image')
    if (!document.querySelector('meta[name="twitter:card"]')) document.head.appendChild(twitterCard)
    
    const twitterTitle = document.querySelector('meta[name="twitter:title"]') || document.createElement('meta')
    if (!twitterTitle.getAttribute('name')) twitterTitle.setAttribute('name', 'twitter:title')
    twitterTitle.setAttribute('content', 'Blog - Gadit')
    if (!document.querySelector('meta[name="twitter:title"]')) document.head.appendChild(twitterTitle)
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]') || document.createElement('meta')
    if (!twitterDescription.getAttribute('name')) twitterDescription.setAttribute('name', 'twitter:description')
    twitterDescription.setAttribute('content', 'Latest updates, tutorials, and insights from the Gadit team')
    if (!document.querySelector('meta[name="twitter:description"]')) document.head.appendChild(twitterDescription)
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', window.location.href)
  }, [])

  return (
    <div className="app">
      <Navbar 
        onLogin={onLogin}
        onRegister={onRegister}
        onLogoClick={onLogoClick}
      />

      <section className="showcase" style={{ paddingTop: '8rem', minHeight: '80vh' }}>
        <div className="showcase-container">
          <div className="showcase-header">
            <h1 className="section-title showcase-title">
              Blog
            </h1>
            <p className="section-subtitle">
              Latest updates, tutorials, and insights from the Gadit team
            </p>
          </div>

          <article className="blog-content">
            <div className="blog-coming-soon">
              <h2>Coming Soon</h2>
              <p>We're working on bringing you the latest articles, tutorials, and insights about web development, mobile apps, and AI automation.</p>
              <p>Stay tuned for updates!</p>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Blog
