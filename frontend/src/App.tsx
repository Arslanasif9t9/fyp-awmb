import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useThemeStore } from './store/theme'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { WorldDetail } from './pages/WorldDetail'
import { Settings } from './pages/Settings'
import { NotFound } from './pages/NotFound'

function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={
            <AppLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/world/:id" element={<WorldDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          } />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  )
}

export default App