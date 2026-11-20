import { useNavigate } from 'react-router-dom';
import { User, Moon, Sun, LogOut, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth';
import { useThemeStore } from '../store/theme';

export const Settings = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-foreground/60 mt-1">Manage your account preferences.</p>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-foreground/60">{user?.email}</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary bg-primary/10 w-fit px-2 py-1 rounded-full">
              <Shield className="h-3 w-3" />
              {user?.role.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Preferences</h3>
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-foreground/70" /> : <Sun className="h-5 w-5 text-foreground/70" />}
              <div>
                <p className="font-medium">Appearance</p>
                <p className="text-xs text-foreground/60">Switch between light and dark mode</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-500 mb-2">Session</h3>
          <p className="text-sm text-foreground/60 mb-4">
            Logging out will end your current session. You will need to enter your credentials again.
          </p>
          <Button variant="danger" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};