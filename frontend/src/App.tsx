import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'sonner'

// Temporary Placeholders (baad mein inko proper pages se replace karenge)
const Landing = () => <div className="p-10 text-3xl font-bold text-primary">Landing Page Coming Soon</div>
const Login = () => <div className="p-10 text-3xl font-bold text-primary">Login Page Coming Soon</div>
const Dashboard = () => <div className="p-10 text-3xl font-bold text-primary">Dashboard Coming Soon</div>

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        {/* Temporary Navbar just to test routing */}
        <nav className="flex gap-4 p-4 bg-card border-b">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
          <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        
        {/* Toaster for notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  )
}

export default App