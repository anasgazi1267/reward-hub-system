
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Gift, 
  Award, 
  FileCheck, 
  User, 
  LogOut, 
  DollarSign,
  Users,
  Settings as SettingsIcon,
  FileText,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import UserCoinDisplay from '../shared/UserCoinDisplay';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const userMenuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Earn Coins', path: '/earn', icon: Award },
    { name: 'Rewards', path: '/rewards', icon: Gift },
    { name: 'Tasks', path: '/tasks', icon: FileCheck },
    { name: 'Withdraw', path: '/withdraw', icon: DollarSign },
    { name: 'Profile', path: '/profile', icon: User },
  ];
  
  const adminMenuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Rewards', path: '/admin/rewards', icon: Gift },
    { name: 'Tasks', path: '/admin/tasks', icon: FileCheck },
    { name: 'Ads', path: '/admin/ads', icon: DollarSign },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];
  
  const menuItems = user?.isAdmin ? adminMenuItems : userMenuItems;
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50 p-3 flex items-center justify-between">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Logo size="sm" />
        {user && <UserCoinDisplay coins={user.coins} size="sm" />}
      </header>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-40 
        ${sidebarOpen ? 'w-64' : 'w-0 lg:w-64'} overflow-hidden`}>
        <div className="pt-5 pb-3 px-4 flex justify-center">
          <Logo size="md" />
        </div>
        
        {user && (
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium">{user.username}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-2">
              <UserCoinDisplay coins={user.coins} />
            </div>
          </div>
        )}
        
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-md flex items-center gap-3 text-sm
                    ${location.pathname === item.path
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-gray-100'
                    }`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
            
            <li className="pt-2 mt-2 border-t border-gray-200">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={18} className="mr-3" />
                <span>Logout</span>
              </Button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`pt-16 lg:pt-0 lg:pl-64 min-h-screen transition-all duration-300`}>
        <div className="container mx-auto p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
