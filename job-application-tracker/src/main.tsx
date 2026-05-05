import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ProtectedRoute } from './App.tsx'
import Home from './pages/Home.tsx'
import { AuthProvider } from './contexts/AuthProvider.tsx'
import { NotificationsProvider } from './contexts/NotificationsContext.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Privacy from './pages/Privacy.tsx'
import Terms from './pages/Terms.tsx'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import Analytics from './pages/Analytics'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
            </Route>
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
