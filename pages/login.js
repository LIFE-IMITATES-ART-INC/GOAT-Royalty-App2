// Login Page
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthProvider'
import { Music, Lock, Mail, Eye, EyeOff, Loader, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate email
      if (!validateEmail(email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (isSignUp) {
        // Sign up validation
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }

        if (!fullName.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }

        const { data, error } = await signUp(email, password, {
          full_name: fullName
        })

        if (error) {
          setError(error.message || 'Failed to create account')
        } else {
          setSuccess('Account created! Check your email to verify your account.')
          // Clear form
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          setFullName('')
          setIsSignUp(false)
        }
      } else {
        // Sign in
        const { data, error } = await signIn(email, password)

        if (error) {
          setError(error.message || 'Invalid email or password')
        } else {
          setSuccess('Login successful! Redirecting...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('artist@goatroyaltyapp.com')
    setPassword('demo123')
    setIsSignUp(false)
    setError('')
    setSuccess('Using demo credentials - click Sign In to continue')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Music className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">GOAT Royalty</h1>
          </div>
          <p className="text-gray-300">Music Royalty Management Platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-purple-500/20 p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                !isSignUp
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                isSignUp
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
              <span className="text-green-300 text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Enter your full name"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="••••••••"
                    required={isSignUp}
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Demo Account */}
          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Use demo account
              </button>
            </div>
          )}

          {/* Forgot Password */}
          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}