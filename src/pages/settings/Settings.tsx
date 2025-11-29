import { useState, useEffect } from 'react'
import { useAuthStore } from '../../app/stores/authStore'
import { Button } from '../../app/components/ui/Button'
import './Settings.scss'

type Theme = 'light' | 'dark' | 'auto'

interface SettingsState {
  theme: Theme
  cardSize: 'small' | 'medium' | 'large'
  defaultSort: 'created_at' | 'title' | 'final_price'
  defaultSortOrder: 'asc' | 'desc'
}

const defaultSettings: SettingsState = {
  theme: 'auto',
  cardSize: 'medium',
  defaultSort: 'created_at',
  defaultSortOrder: 'desc'
}

export function Settings() {
  const { user } = useAuthStore()
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)

  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Failed to parse settings:', error)
      }
    }

    applyTheme(settings.theme)
  }, [])

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light')
    } else {
      root.classList.add(`theme-${theme}`)
    }
  }

  const handleThemeChange = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }))
    applyTheme(theme)
    saveSettings({ ...settings, theme })
  }

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const saveSettings = (newSettings: SettingsState) => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(newSettings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings(defaultSettings)
      applyTheme(defaultSettings.theme)
      localStorage.removeItem('app-settings')
    }
  }

  if (!user) {
    return (
      <div className="settings-page">
        <div className="settings-error">
          <h2>Please log in</h2>
          <p>You need to be logged in to access settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>Settings</h1>

        <div className="settings-content">
          <div className="settings-section">
            <h2>Appearance</h2>

            <div className="setting-item">
              <label className="setting-label">Theme</label>
              <div className="setting-control">
                <select
                  value={settings.theme}
                  onChange={(e) => handleThemeChange(e.target.value as Theme)}
                  className="setting-select"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
                <p className="setting-description">
                  Choose your preferred color theme
                </p>
              </div>
            </div>

            <div className="setting-item">
              <label className="setting-label">Card Size</label>
              <div className="setting-control">
                <select
                  value={settings.cardSize}
                  onChange={(e) => handleSettingChange('cardSize', e.target.value)}
                  className="setting-select"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
                <p className="setting-description">
                  Default size for recipe cards
                </p>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2>Recipes</h2>

            <div className="setting-item">
              <label className="setting-label">Default Sort By</label>
              <div className="setting-control">
                <select
                  value={settings.defaultSort}
                  onChange={(e) => handleSettingChange('defaultSort', e.target.value)}
                  className="setting-select"
                >
                  <option value="created_at">Date Created</option>
                  <option value="title">Title</option>
                  <option value="final_price">Price</option>
                </select>
                <p className="setting-description">
                  Default sorting for recipes list
                </p>
              </div>
            </div>

            <div className="setting-item">
              <label className="setting-label">Default Sort Order</label>
              <div className="setting-control">
                <select
                  value={settings.defaultSortOrder}
                  onChange={(e) => handleSettingChange('defaultSortOrder', e.target.value)}
                  className="setting-select"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
                <p className="setting-description">
                  Default sort order
                </p>
              </div>
            </div>
          </div>

          <div className="settings-actions">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
