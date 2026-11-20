import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useThemeStore } from './store/theme'
import { AppLayout } from './components/layout/AppLayout'

// Temporary Pages
const Dashboard = () => <div className="text-2xl font-bold">Dashboard Page</div>
const Worlds = () => <div className="text-2xl font-bold">My Worlds Page</div>
const Settings = () => <div className="text-2xl font-bold">Settings Page</div>
const Login = () => <div className="text-2xl font-bold">Login Page (No Sidebar)</div>

function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes with Layout */}
        <Route path="/*" element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/worlds" element={<Worlds />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </AppLayout>
        } />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  )
}

export default App