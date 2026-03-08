import '../styles/globals.css'
import '../styles/animations.css'
import '../styles/super-goat.css'
import { AuthProvider } from '../components/AuthProvider'
import ProtectedRoute from '../components/ProtectedRoute'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

// Pages that don't require authentication
const publicPages = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/dashboard', '/media-gallery', '/streaming', '/interactive', '/deploy', '/artwork', '/documents', '/ms-vanessa', '/fingerprint-auth', '/tracks', '/super-ninja-dashboard', '/super-ninja/ai-agent', '/goat-branding-demo', '/super-goat-command', '/adobe-firefly', '/openclaw', '/cyber-warrior', '/music-player', '/royalty-engine', '/sendme-network', '/upstaxx', '/asap-catalog', '/cinema-camera', '/sora-ai-studio', '/nvidia-dgx', '/investor-demo', '/complete-platform', '/fashion-store', '/contact', '/privacy', '/terms', '/copyright', '/publishing', '/search', '/sono-studio', '/concert-booking', '/unreal-engine', '/ai-red-team', '/animation-studio', '/codex-008', '/voice-studio', '/conchord', '/ai-studio', '/ai-tools', '/ai-image-studio', '/ai-code', '/ai-writer', '/ai-research', '/deep-research', '/gemini-ai']

// GOAT Force Loading Screen Component
function GOATLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center">
      {/* Background video loop */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      >
        <source src="/videos/goat-logo-animation.mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      
      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <img 
          src="/images/branding/goat-logo.png" 
          alt="GOAT Force" 
          className="w-32 h-32 rounded-2xl goat-logo-img animate-pulse"
        />
        <h1 className="mt-6 text-3xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent"
            style={{ fontFamily: "'Avengeance', 'Orbitron', Impact, sans-serif", letterSpacing: '0.08em' }}>
          GOAT FORCE
        </h1>
        <p className="text-gray-500 text-xs tracking-[0.4em] mt-1"
           style={{ fontFamily: "'Orbitron', 'Rajdhani', monospace" }}>ROYALTY COMMAND CENTER</p>
        
        {/* Loading bar */}
        <div className="mt-8 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 rounded-full animate-loading-bar" 
               style={{ animation: 'loading-bar 1.5s ease-in-out infinite' }} />
        </div>
        <p className="text-gray-400 text-xs font-mono mt-3">INITIALIZING SYSTEMS...</p>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const isPublicPage = publicPages.includes(router.pathname)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Show loading screen for 2 seconds on initial load
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Route change loading
  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => {
      setTimeout(() => setLoading(false), 800)
    }
    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)
    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  return (
    <AuthProvider>
      {loading && <GOATLoadingScreen />}
      {isPublicPage ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </AuthProvider>
  )
}

export default MyApp