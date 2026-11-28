import { useThemeStore } from '../../store/theme';
import { Moon, Sun, Bell, Search, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

export const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 w-full md:w-96">
        <button onClick={onMenuClick} className="md:hidden text-foreground/70 hover:text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg border border-border w-full">
          <Search className="h-4 w-4 text-foreground/50 shrink-0" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-foreground/40 text-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0 ml-4">
        <Button variant="ghost" size="sm" onClick={toggleTheme} className="rounded-full w-10 h-10 p-0">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 relative hidden md:flex">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>

        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
};