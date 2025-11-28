import { useState } from 'react'
import { useAuthStore } from '../../app/stores/authStore'
import { Button } from '../../app/components/ui/Button'
import { Input } from '../../app/components/ui/Input'
import './Auth.scss'

export function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const { signIn, signUp } = useAuthStore()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!isLogin && !formData.username) {
      newErrors.username = 'Username is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
      } else {
        await signUp(formData.email, formData.password, formData.username)
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({ submit: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }))
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setFormData(prev => ({ ...prev, username: '' }))
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to your account' : 'Sign up to get started'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <Input
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              error={errors.username}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          )}

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            placeholder="Enter your email"
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            placeholder="Enter your password"
            disabled={isLoading}
          />

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="auth-submit"
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={switchMode}
              className="switch-button"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}