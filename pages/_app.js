import '../styles/globals.css'
import '../styles/animations.css'
import '../styles/super-goat.css'
import { AuthProvider } from '../components/AuthProvider'
import ProtectedRoute from '../components/ProtectedRoute'
import { useRouter } from 'next/router'

// Pages that don't require authentication
const publicPages = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/dashboard', '/media-gallery', '/streaming', '/interactive', '/deploy', '/artwork', '/documents', '/ms-vanessa', '/fingerprint-auth', '/tracks', '/super-ninja-dashboard', '/super-ninja/ai-agent', '/goat-branding-demo', '/super-goat-command', '/adobe-firefly']

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const isPublicPage = publicPages.includes(router.pathname)

  return (
    <AuthProvider>
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