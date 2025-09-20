import { motion } from 'framer-motion'
import { Sun, Cloud, CloudRain, Wind, Droplets } from 'lucide-react'

interface WeatherData {
  current: {
    temp: number
    condition: string
    humidity: number
    wind: number
  }
  forecast: Array<{
    day: string
    temp: number
    condition: string
  }>
}

interface WeatherCardProps {
  data: WeatherData
  advice?: string
  delay?: number
}

const weatherIcons = {
  Sunny: Sun,
  Cloudy: Cloud,
  Rain: CloudRain
}

export function WeatherCard({ data, advice, delay = 0 }: WeatherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50"
    >
      {/* Current Weather */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          {(() => {
            const Icon = weatherIcons[data.current.condition as keyof typeof weatherIcons] || Sun
            return <Icon className="w-12 h-12 text-yellow-500" />
          })()}
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-1">
          {data.current.temp}°C
        </div>
        <div className="text-gray-600">{data.current.condition}</div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <div className="text-sm text-gray-600">Humidity</div>
          <div className="font-semibold">{data.current.humidity}%</div>
        </div>
        <div className="text-center">
          <Wind className="w-5 h-5 text-gray-500 mx-auto mb-1" />
          <div className="text-sm text-gray-600">Wind</div>
          <div className="font-semibold">{data.current.wind} km/h</div>
        </div>
      </div>

      {/* Forecast */}
      <div className="grid grid-cols-4 gap-2">
        {data.forecast.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-sm text-gray-600 mb-1">{day.day}</div>
            {(() => {
              const Icon = weatherIcons[day.condition as keyof typeof weatherIcons] || Sun
              return <Icon className="w-6 h-6 text-gray-500 mx-auto mb-1" />
            })()}
            <div className="text-sm font-medium">{day.temp}°C</div>
          </div>
        ))}
      </div>

      {/* Farming Advice */}
      {advice && (
        <div className="mt-6 bg-green-50 rounded-lg p-3">
          <div className="text-sm font-medium text-green-800 mb-1">Farming Advice</div>
          <div className="text-xs text-green-700">{advice}</div>
        </div>
      )}
    </motion.div>
  )
}
