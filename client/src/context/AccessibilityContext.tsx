import React, { createContext, useContext, useState, useEffect } from 'react'

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  highContrast: boolean
  reducedMotion: boolean
  audioDescriptions: boolean
  keyboardNavigation: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void
  resetSettings: () => void
  isAccessibilityPanelOpen: boolean
  toggleAccessibilityPanel: () => void
  isAccessibilityPanelMinimized: boolean
  toggleAccessibilityPanelMinimized: () => void
  hideAccessibilityPanel: () => void
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  audioDescriptions: false,
  keyboardNavigation: false
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings')
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  })
  
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false)
  const [isAccessibilityPanelMinimized, setIsAccessibilityPanelMinimized] = useState(false)

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement
    
    // Font size
    root.style.setProperty('--accessibility-font-size', 
      settings.fontSize === 'small' ? '0.875rem' :
      settings.fontSize === 'medium' ? '1rem' :
      settings.fontSize === 'large' ? '1.125rem' : '1.25rem'
    )
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
    
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
  }, [settings])

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  const toggleAccessibilityPanel = () => {
    setIsAccessibilityPanelOpen(prev => !prev)
    if (isAccessibilityPanelMinimized) {
      setIsAccessibilityPanelMinimized(false)
    }
  }

  const toggleAccessibilityPanelMinimized = () => {
    setIsAccessibilityPanelMinimized(prev => !prev)
  }

  const hideAccessibilityPanel = () => {
    setIsAccessibilityPanelOpen(false)
    setIsAccessibilityPanelMinimized(false)
  }

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isAccessibilityPanelOpen,
        toggleAccessibilityPanel,
        isAccessibilityPanelMinimized,
        toggleAccessibilityPanelMinimized,
        hideAccessibilityPanel
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}
