import { Link } from 'react-router-dom'
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Globe,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function LuxuryFooter() {
  const { user } = useAuth()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-300 hover:text-white">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dashboards</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard/farmer" className="text-gray-300 hover:text-white">
                  Farmer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/ngo" className="text-gray-300 hover:text-white">
                  NGO Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/trader" className="text-gray-300 hover:text-white">
                  Trader Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-gray-300">support@agroai.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-gray-300">+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="text-gray-300">Nairobi, Kenya</span>
              </li>
            </ul>
          </div>

          {/* Social & Language */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            {/* Social Media Links */}
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>English</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AgroAI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
