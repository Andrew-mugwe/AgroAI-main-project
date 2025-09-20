import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu as MenuIcon,
  Search,
  Heart,
  User,
  ChevronDown,
  Phone,
  Sparkles
} from 'lucide-react'
import { AgroIcon } from '../icons/AgroIcon'

interface LuxuryHeaderProps {
  children: ReactNode
}

export function LuxuryHeader({ children }: LuxuryHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-8">
            {children} {/* This renders the Navigation/Menu component */}
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors group">
              <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">Search</span>
            </button>
          </div>

          {/* Center - Brand */}
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2"
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Link to="/">
              <motion.h1 
                className="font-antarctica text-[24px] md:text-[28px] tracking-[0.5em] font-normal uppercase text-center relative"
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  hover: { scale: 1.02 }
                }}
                transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
              >
                {/* Main Logo Container */}
                <motion.div className="relative flex items-center gap-4 md:gap-5">
                  {/* Icon Animation */}
                  <motion.div
                    className="relative w-10 h-10 md:w-12 md:h-12"
                    variants={{
                      initial: { rotate: -30, opacity: 0 },
                      animate: { rotate: 0, opacity: 1 },
                      hover: { scale: 1.1, rotate: 5 }
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      variants={{
                        hover: {
                          rotate: [0, -10, 10, -5, 5, 0],
                          transition: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }
                      }}
                    >
                      <AgroIcon 
                        className="w-full h-full text-green-600"
                      />
                    </motion.div>
                    
                    {/* Icon Glow Effect */}
                    <motion.div
                      className="absolute inset-0 bg-green-400 rounded-full blur-xl"
                      variants={{
                        initial: { opacity: 0, scale: 0.8 },
                        animate: { opacity: 0.2, scale: 1 },
                        hover: { 
                          opacity: [0.2, 0.4, 0.2],
                          scale: [1, 1.2, 1],
                          transition: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }
                      }}
                    />
                  </motion.div>

                  {/* Text with Gradient Animation */}
                  <motion.div
                    className="relative z-10"
                    variants={{
                      hover: {
                        x: 2,
                        transition: { duration: 0.3 }
                      }
                    }}
                  >
                    <motion.span 
                      className="font-lv inline-block text-[#000] text-[24px] tracking-[.3em] font-semibold leading-none select-none"
                    >
                      A&nbsp;G&nbsp;R&nbsp;O&nbsp;&nbsp;&nbsp;A&nbsp;I
                    </motion.span>
                  </motion.div>

                  {/* Animated Tagline */}
                  <motion.div 
                    className="absolute -bottom-4 left-0 right-0"
                    variants={{
                      hover: {
                        y: 0,
                        opacity: 1,
                        transition: { duration: 0.3, delay: 0.1 }
                      }
                    }}
                    initial={{ y: 10, opacity: 0 }}
                  >
                    <span className="text-[10px] uppercase tracking-[0.25em] font-light text-green-600">
                      Technology
                    </span>
                  </motion.div>

                  {/* Animated Border */}
                  <motion.div
                    className="absolute -inset-2 rounded-xl"
                    variants={{
                      hover: {
                        scale: 1,
                        opacity: 1
                      }
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: `
                        linear-gradient(to right, transparent, rgba(16, 185, 129, 0.1), transparent),
                        linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.1), transparent)
                      `
                    }}
                  />

                  {/* Radial Glow */}
                  <motion.div
                    className="absolute inset-0 -z-10"
                    variants={{
                      hover: {
                        scale: 1.5,
                        opacity: 0.15
                      }
                    }}
                    initial={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)'
                    }}
                  />
                </motion.div>
              </motion.h1>
            </Link>
          </motion.div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            <button className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Call Us
            </button>
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 transform duration-200">
              <Heart className="h-5 w-5" />
            </button>
            <div className="relative group">
              <select className="appearance-none bg-white border border-gray-200 rounded-xl px-6 py-2.5 text-base text-gray-900 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer pr-12 font-medium transition-all duration-200 min-w-[160px] shadow-sm">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
            <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-gray-700 transition-colors hover:scale-110 transform duration-200">
              C
            </button>
            <Link to="/auth/login" className="p-2 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 transform duration-200">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}