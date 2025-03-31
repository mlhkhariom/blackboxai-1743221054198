
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../components/ui/use-toast';
import { 
  MoonStar, 
  Sun, 
  Menu, 
  X, 
  Settings, 
  Film, 
  Radio, 
  Home, 
  Cloud,
  Upload,
  RefreshCw,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { logout, settings } = useAdmin();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Apply theme when component mounts or theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    toast({
      title: "Theme Changed",
      description: `Switched to ${newTheme} mode`,
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
    { path: '/admin/content', label: 'Content', icon: <Film className="mr-2 h-4 w-4" /> },
    { path: '/admin/live-tv', label: 'Live TV', icon: <Radio className="mr-2 h-4 w-4" /> },
    { path: '/admin/cloudstream', label: 'CloudStream', icon: <Cloud className="mr-2 h-4 w-4" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="mr-2 h-4 w-4" /> },
  ];

  const renderMenuItems = () => (
    <ul className="space-y-2">
      {menuItems.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === item.path
                ? `bg-${settings.primaryColor} text-white bg-opacity-90`
                : 'hover:bg-moviemate-card/50 text-gray-300 hover:text-white'
            }`}
            onClick={() => isMobile && setIsOpen(false)}
          >
            {item.icon}
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const sidebar = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Link to="/admin" className="flex items-center">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto mr-2" />
            ) : null}
            <span className="text-xl font-bold text-white">{settings.siteName} Admin</span>
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        {renderMenuItems()}
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Dark Mode</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <MoonStar className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full border-gray-700"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-50 md:hidden"
            >
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] border-r border-gray-700 bg-moviemate-background p-0">
            {sidebar}
          </SheetContent>
        </Sheet>
      ) : (
        <div className="hidden border-r border-gray-700 bg-moviemate-background md:block">
          {sidebar}
        </div>
      )}
      <main className="bg-moviemate-background">{children}</main>
    </div>
  );
};

export default AdminLayout;
