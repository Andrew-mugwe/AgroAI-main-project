import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AccessibilityFeatures = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    contrast: 'normal',
    audioDescriptions: false,
    keyboardNavigation: false,
    reducedMotion: false,
    highContrast: false
  });

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Apply settings to document
    applyAccessibilitySettings(settings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const applyAccessibilitySettings = (newSettings) => {
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    root.style.fontSize = fontSizeMap[newSettings.fontSize] || '16px';
    
    // Contrast
    if (newSettings.highContrast) {
      root.style.setProperty('--color-forest', '#000000');
      root.style.setProperty('--color-wheat', '#FFFFFF');
      root.style.setProperty('--color-text', '#000000');
      root.style.setProperty('--color-background', '#FFFFFF');
    } else {
      root.style.removeProperty('--color-forest');
      root.style.removeProperty('--color-wheat');
      root.style.removeProperty('--color-text');
      root.style.removeProperty('--color-background');
    }
    
    // Reduced motion
    if (newSettings.reducedMotion) {
      root.style.setProperty('--reduced-motion', 'reduce');
    } else {
      root.style.removeProperty('--reduced-motion');
    }
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const accessibilityOptions = [
    {
      id: 'fontSize',
      label: 'Font Size',
      type: 'select',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'xlarge', label: 'Extra Large' }
      ]
    },
    {
      id: 'highContrast',
      label: 'High Contrast',
      type: 'toggle',
      description: 'Increase contrast for better visibility'
    },
    {
      id: 'reducedMotion',
      label: 'Reduced Motion',
      type: 'toggle',
      description: 'Reduce animations for motion sensitivity'
    },
    {
      id: 'audioDescriptions',
      label: 'Audio Descriptions',
      type: 'toggle',
      description: 'Enable audio descriptions for images'
    },
    {
      id: 'keyboardNavigation',
      label: 'Keyboard Navigation',
      type: 'toggle',
      description: 'Enhanced keyboard navigation support'
    }
  ];

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-green-800 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
        aria-label="Accessibility Settings"
      >
        <span className="text-xl">♿</span>
      </button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-40 overflow-y-auto transform translate-x-[-20px]"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Accessibility</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close accessibility panel"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {accessibilityOptions.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {option.label}
                    </label>
                    
                    {option.type === 'select' ? (
                      <select
                        value={settings[option.id]}
                        onChange={(e) => handleSettingChange(option.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {option.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleSettingChange(option.id, !settings[option.id])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[option.id] ? 'bg-gray-900' : 'bg-gray-200'
                          }`}
                          role="switch"
                          aria-checked={settings[option.id]}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings[option.id] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-gray-600">
                          {settings[option.id] ? 'On' : 'Off'}
                        </span>
                      </div>
                    )}
                    
                    {option.description && (
                      <p className="text-xs text-gray-500">{option.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Speak current page content
                      if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(
                          document.title + '. ' + 
                          Array.from(document.querySelectorAll('p, h1, h2, h3'))
                            .slice(0, 3)
                            .map(el => el.textContent)
                            .join('. ')
                        );
                        speechSynthesis.speak(utterance);
                      }
                    }}
                    className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    🔊 Read Page Aloud
                  </button>
                  <button
                    onClick={() => {
                      // Focus on main content
                      const main = document.querySelector('main') || document.querySelector('#root');
                      main?.focus();
                    }}
                    className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    🎯 Skip to Main Content
                  </button>
                  <button
                    onClick={() => {
                      // Show keyboard shortcuts
                      alert('Keyboard Shortcuts:\n\n' +
                        'Tab - Navigate\n' +
                        'Enter/Space - Activate\n' +
                        'Escape - Close dialogs\n' +
                        'Ctrl + Plus - Zoom in\n' +
                        'Ctrl + Minus - Zoom out\n' +
                        'Ctrl + 0 - Reset zoom'
                      );
                    }}
                    className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    ⌨️ Show Keyboard Shortcuts
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityFeatures;