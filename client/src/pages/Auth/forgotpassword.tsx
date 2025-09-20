import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  ArrowLeft, 
  ArrowRight,
  Eye, 
  EyeOff, 
  Lock,
  Check,
  RefreshCw,
  ChevronDown
} from 'lucide-react'

interface FormData {
  email: string
  phone: string
  contactMethod: 'email' | 'phone'
  otp: string
  newPassword: string
  confirmPassword: string
}

export default function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    contactMethod: 'email',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'newPassword') {
      calculatePasswordStrength(value)
    }
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep(4) // Success step
    }, 2000)
  }

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 luxury-font mb-4">
          Forgot your password?
        </h1>
        <p className="text-gray-600 text-lg">
          Enter your phone number or email to reset it
        </p>
      </div>

      <div className="space-y-4">
        {/* Contact Method Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => handleInputChange('contactMethod', 'email')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              formData.contactMethod === 'email'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="inline h-4 w-4 mr-2" />
            Email
          </button>
          <button
            onClick={() => handleInputChange('contactMethod', 'phone')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              formData.contactMethod === 'phone'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Phone className="inline h-4 w-4 mr-2" />
            Phone
          </button>
        </div>

        {/* Input Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
          </label>
          <div className="relative">
            {formData.contactMethod === 'email' ? (
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            ) : (
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            )}
            <input
              type={formData.contactMethod === 'email' ? 'email' : 'tel'}
              value={formData.contactMethod === 'email' ? formData.email : formData.phone}
              onChange={(e) => handleInputChange(
                formData.contactMethod === 'email' ? 'email' : 'phone', 
                e.target.value
              )}
              className="luxury-input w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={formData.contactMethod === 'email' 
                ? 'Enter your email address' 
                : 'Enter your phone number'
              }
            />
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={nextStep}
        disabled={!formData.email && !formData.phone}
        className="luxury-button w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send Reset Code
        <ArrowRight className="ml-2 h-5 w-5" />
      </motion.button>

      <div className="text-center">
        <a
          href="/login"
          className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </a>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 luxury-font mb-4">
          Verify your account
        </h1>
        <p className="text-gray-600 text-lg">
          Enter the 6-digit code sent to your {formData.contactMethod}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {formData.contactMethod === 'email' ? formData.email : formData.phone}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5, 6].map((digit) => (
            <input
              key={digit}
              type="text"
              maxLength={1}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
              onChange={(e) => {
                const newOtp = formData.otp.split('')
                newOtp[digit - 1] = e.target.value
                handleInputChange('otp', newOtp.join(''))
              }}
            />
          ))}
        </div>

        <div className="text-center space-y-2">
          <button className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center mx-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Resend OTP
          </button>
          <p className="text-sm text-gray-500">
            Didn't receive the code?{' '}
            <button 
              onClick={() => handleInputChange('contactMethod', formData.contactMethod === 'email' ? 'phone' : 'email')}
              className="text-green-600 hover:text-green-700"
            >
              Switch to {formData.contactMethod === 'email' ? 'Phone' : 'Email'}
            </button>
          </p>
        </div>
      </div>

      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={prevStep}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="inline h-5 w-5 mr-2" />
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={nextStep}
          disabled={formData.otp.length !== 6}
          className="flex-1 luxury-button bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify Code
          <ArrowRight className="ml-2 h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 luxury-font mb-4">
          Set a new password
        </h1>
        <p className="text-gray-600 text-lg">
          Create a strong password to secure your account
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className="luxury-input w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          
          {/* Password Strength Meter */}
          <div className="mt-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-2 flex-1 rounded-full ${
                    level <= passwordStrength
                      ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {passwordStrength < 3 ? 'Weak' : passwordStrength < 4 ? 'Good' : 'Strong'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="luxury-input w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={prevStep}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="inline h-5 w-5 mr-2" />
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword || isLoading}
          className="flex-1 luxury-button bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </motion.button>
      </div>
    </motion.div>
  )

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
      >
        <Check className="h-10 w-10 text-green-600" />
      </motion.div>
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 luxury-font mb-4">
          Password reset successful!
        </h1>
        <p className="text-gray-600 text-lg">
          You can now log in to AgroAI with your new password
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.location.href = '/login'}
        className="luxury-button bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-8 rounded-xl font-semibold"
      >
        Go to Login
      </motion.button>
    </motion.div>
  )

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Progress Bar */}
          {currentStep < 4 && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep} of 3</span>
                <span>{Math.round((currentStep / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 3) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderSuccess()}
          </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  )
}
