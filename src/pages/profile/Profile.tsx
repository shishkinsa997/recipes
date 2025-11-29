import { useState, useEffect } from 'react'
import { useAuthStore } from '../../app/stores/authStore'
import { supabase } from '../../app/services/supabase'
import { Button } from '../../app/components/ui/Button'
import { Input } from '../../app/components/ui/Input'
import { useNavigate } from 'react-router-dom'
import './Profile.scss'

export function Profile() {
  const { user, profile, signOut, checkAuth } = useAuthStore()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    avatar_url: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile])

  const handleUpdateProfile = async () => {
    if (!user) return

    const newErrors: Record<string, string> = {}
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username.trim(),
          avatar_url: formData.avatar_url.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      await checkAuth()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setErrors({ submit: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <h2>Please log in</h2>
          <p>You need to be logged in to view your profile.</p>
          <Button onClick={() => navigate('/auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Profile</h1>

        <div className="profile-content">
          <div className="profile-avatar">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {formData.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="profile-info">
            {isEditing ? (
              <div className="profile-form">
                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, username: e.target.value }))
                    if (errors.username) setErrors(prev => ({ ...prev, username: '' }))
                  }}
                  error={errors.username}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />

                <Input
                  label="Avatar URL"
                  value={formData.avatar_url}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, avatar_url: e.target.value }))
                  }}
                  placeholder="https://example.com/avatar.jpg"
                  disabled={isLoading}
                />

                {errors.submit && (
                  <div className="error-message">{errors.submit}</div>
                )}

                <div className="profile-actions">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setErrors({})
                      if (profile) {
                        setFormData({
                          username: profile.username || '',
                          avatar_url: profile.avatar_url || ''
                        })
                      }
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="profile-display">
                <div className="profile-field">
                  <span className="field-label">Email:</span>
                  <span className="field-value">{user.email}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Username:</span>
                  <span className="field-value">{profile?.username || 'Not set'}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Member since:</span>
                  <span className="field-value">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>

                <div className="profile-actions">
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                  <Button variant="danger" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
