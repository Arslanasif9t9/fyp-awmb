import { useThemeStore } from '../../store/theme'
import { Moon, Sun, Bell, Search } from 'lucide-react'
import { Button } from '../ui/Button'

export const Header = () => {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg border border-border w-96 max-w-full">
        <Search className="h-4 w-4 text-foreground/50" />
        <input 
          type="text" 
          placeholder="Search worlds, files, or ask a question..." 
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-foreground/40 text-foreground"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={toggleTheme} className="rounded-full w-10 h-10 p-0">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>

        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  )
}