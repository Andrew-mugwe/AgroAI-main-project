import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dashboard } from '../services/api'

export function useDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        let response
        switch (user?.role) {
          case 'farmer':
            response = await dashboard.getFarmerDashboard()
            break
          case 'ngo':
            response = await dashboard.getNGODashboard()
            break
          case 'trader':
            response = await dashboard.getTraderDashboard()
            break
          default:
            response = await dashboard.getDashboard()
        }

        setData(response)
      } catch (err) {
        setError(err.response?.data || 'Error fetching dashboard data')
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)

      let response
      switch (user?.role) {
        case 'farmer':
          response = await dashboard.getFarmerDashboard()
          break
        case 'ngo':
          response = await dashboard.getNGODashboard()
          break
        case 'trader':
          response = await dashboard.getTraderDashboard()
          break
        default:
          response = await dashboard.getDashboard()
      }

      setData(response)
    } catch (err) {
      setError(err.response?.data || 'Error fetching dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}
