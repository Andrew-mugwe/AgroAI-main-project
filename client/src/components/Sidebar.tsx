import { NavLink } from 'react-router-dom'
import { 
  Home, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  Leaf,
  Droplets,
  Sun,
  Thermometer
} from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const sensorData = [
  { name: 'Soil Moisture', value: '65%', icon: Droplets, status: 'good' },
  { name: 'Temperature', value: '24°C', icon: Thermometer, status: 'good' },
  { name: 'Light Level', value: '85%', icon: Sun, status: 'good' },
  { name: 'Plant Health', value: 'Excellent', icon: Leaf, status: 'excellent' },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Sensor Status</h3>
          <div className="space-y-3">
            {sensorData.map((sensor) => (
              <div key={sensor.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <sensor.icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{sensor.name}</span>
                </div>
                <span className={`text-sm font-medium ${
                  sensor.status === 'excellent' ? 'text-green-600' :
                  sensor.status === 'good' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {sensor.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}
