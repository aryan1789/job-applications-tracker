import { Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthProvider'

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}
