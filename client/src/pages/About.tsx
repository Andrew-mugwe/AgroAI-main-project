import { motion } from 'framer-motion'
import { 
  Leaf, 
  Brain,
  Users,
  Globe,
  LineChart,
  Shield
} from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Our advanced AI algorithms analyze real-time data to provide personalized recommendations for crop management, pest control, and resource optimization."
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Connect with farmers worldwide, share experiences, and learn from successful agricultural practices across different regions and climates."
    },
    {
      icon: Leaf,
      title: "Sustainable Farming",
      description: "Access tools and knowledge to implement sustainable farming practices that benefit both your yields and the environment."
    },
    {
      icon: Globe,
      title: "Market Access",
      description: "Connect directly with buyers, track market trends, and get fair prices for your produce through our global marketplace."
    },
    {
      icon: LineChart,
      title: "Data-Driven Decisions",
      description: "Make informed decisions with comprehensive analytics, weather forecasts, and market trend analysis."
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Protect your farm with early warning systems for weather events, pest outbreaks, and market fluctuations."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transforming Agriculture with
              <span className="block text-green-600">Technology & Community</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AgroAI combines cutting-edge technology with traditional farming wisdom to create
              a sustainable and profitable future for farmers worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              We're on a mission to empower farmers with the tools, knowledge, and community
              they need to thrive in modern agriculture. By combining AI technology with
              sustainable practices, we're helping create a more resilient and profitable
              farming future.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About
