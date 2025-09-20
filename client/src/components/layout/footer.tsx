import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Globe
} from 'lucide-react'

export function Footer() {
  const { user } = useAuth()

  const mainLinks = [
    { title: 'Home', path: '/' },
    { title: 'About Us', path: '/about' },
    { title: 'Marketplace', path: '/marketplace' },
    { title: 'Contact', path: '/contact' }
  ]

  const dashboardLinks = [
    { title: 'Farmer Dashboard', path: '/dashboard/farmer', role: 'farmer' },
    { title: 'NGO Dashboard', path: '/dashboard/ngo', role: 'ngo' },
    { title: 'Trader Dashboard', path: '/dashboard/trader', role: 'trader' }
  ]

  const resourceLinks = [
    { title: 'Help Center', path: '/help' },
    { title: 'Blog', path: '/blog' },
    { title: 'FAQs', path: '/faqs' },
    { title: 'Terms of Service', path: '/terms' },
    { title: 'Privacy Policy', path: '/privacy' }
  ]

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/agroai' },
    { icon: Twitter, href: 'https://twitter.com/agroai' },
    { icon: Instagram, href: 'https://instagram.com/agroai' },
    { icon: Youtube, href: 'https://youtube.com/agroai' }
  ]

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AgroAI</h3>
            <p className="text-gray-600 mb-4">
              Empowering farmers with AI-driven agriculture solutions.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {mainLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboards</h3>
            <ul className="space-y-2">
              {dashboardLinks.map((link) => (
                (!link.role || user?.role === link.role) && (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-600 hover:text-green-600 transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                )
              ))}
              {!user && (
                <li>
                  <Link
                    to="/auth/login"
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    Login to access dashboards
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>support@agroai.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-5 h-5" />
                <span>+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <Globe className="w-5 h-5" />
                <select className="bg-transparent text-gray-600 focus:outline-none">
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                </select>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600">
              © {new Date().getFullYear()} AgroAI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {resourceLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-600 hover:text-green-600 transition-colors text-sm"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}