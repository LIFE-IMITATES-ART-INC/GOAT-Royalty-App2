import '../styles/globals.css'
import '../styles/animations.css'
import { AuthProvider } from '../components/AuthProvider'
import ProtectedRoute from '../components/ProtectedRoute'
import { useRouter } from 'next/router'

// Pages that don't require authentication
const publicPages = [
  '/', '/login', '/signup', '/forgot-password', '/reset-password',
  '/dashboard', '/command-center', '/media-gallery', '/streaming',
  '/interactive', '/deploy', '/artwork', '/documents', '/ms-vanessa',
  '/fingerprint-auth', '/tracks', '/super-ninja-dashboard',
  '/super-ninja/ai-agent', '/goat-branding-demo', '/analytics',
  '/publishing', '/asap-catalog', '/search', '/contact',
  '/copyright', '/privacy', '/terms'
]

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