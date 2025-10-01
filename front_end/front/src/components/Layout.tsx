import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import {
  ChevronLeft,
  ChevronRight, 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  Building,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(); // Use the hook
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return true; // Default to dark mode if no theme is saved
  });

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on mount
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save theme preference to local storage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Theme colors
  const themeColors = {
    background: isDarkMode ? "#121212" : "#ffffff",
    text: "text-white",
    textMuted: "text-gray-300",
    sidebar: "bg-blue-800",
    sidebarBorder: "border-blue-700",
    sidebarHover: "hover:bg-blue-700",
    sidebarActive: "bg-blue-700",
    headerBackground: "bg-blue-700",
    contentBackground: isDarkMode ? "bg-gray-800" : "bg-gray-50",
    panelBackground: isDarkMode ? "bg-blue-900" : "bg-blue-100",
    dropdownBackground: isDarkMode ? "bg-gray-900" : "bg-pink",
    dropdownHover: "hover:bg-blue-700",
    buttonIcon: "text-white",
    notificationDot: isDarkMode ? "bg-blue-500" : "bg-blue-600",
    avatarBorder: isDarkMode ? "border-gray-700" : "border-gray-300",
    avatarBackground: "bg-blue-700",
  };

  
  const navigation = [
    {
      name: t('layout.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['root', 'administrator', 'technician', 'validator']
    },
    {
      name: t('layout.documents'),
      href: '/forms',
      icon: FileText,
      roles: ['technician', 'validator']
    },
    {
      name: t('layout.formTemplates'),
      href: '/form-templates',
      icon: ClipboardList,
      roles: ['administrator']
    },
    {
      name: t('layout.formAssignments'), 
      href: '/admin/form-assignments',
      icon: ClipboardList, 
      roles: ['administrator']
    },
     {
      name: t('layout.formTemplates'),
      href: '/root/form-templates',
      icon: ClipboardList,
      roles: ['root']
    },
    {
      name: t('layout.collaborators'),
      href: '/collaborators',
      icon: Users,
      roles: ['administrator']
    },
    {
      name: t('layout.companies'),
      href: '/companies',
      icon: Building,
      roles: ['root']
    },
    {
      name: t('layout.discussion'),
      href: '/discussion',
      icon: Bell, // Using Bell icon for now, can be changed later
      roles: ['administrator', 'technician', 'validator']
    },
   
  ];

  // Filter navigation based on user role and search query
  const filteredNavigation = navigation
    .filter(item => item.roles.includes(user.role))
    .filter(item => 
      searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className={cn("min-h-screen flex", isDarkMode ? "text-white" : "text-gray-900")}>
      {/* Main background */}
      <div 
        className="fixed inset-0 z-0" 
        style={{
          backgroundColor: themeColors.background,
        }}
      />

      {/* Sidebar for desktop */}
      <div 
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col transition-all duration-300 ease-in-out",
          themeColors.sidebar,
          sidebarOpen ? "w-64" : "w-20",
          windowWidth < 1024 && !mobileMenuOpen && "hidden"
        )}
      >
        {/* Sidebar header */}
        <div className={cn(
          "flex h-16 items-center px-4 border-b",
          themeColors.sidebarBorder,
          sidebarOpen ? "justify-between" : "justify-center"
        )}>
          {sidebarOpen && (
            <div className={cn("font-bold text-xl", themeColors.text)}>G F D</div>
          )}
          {!sidebarOpen && (
            <div className={cn("font-bold text-xl", themeColors.text)}></div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn("rounded-full", themeColors.text, themeColors.sidebarHover)}
          >
            {sidebarOpen ? 
              <ChevronLeft className="h-5 w-5" /> : 
              <ChevronRight className="h-5 w-5" />
            }
          </Button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? themeColors.sidebarActive
                      : cn("text-white", themeColors.sidebarHover),
                    !sidebarOpen && "justify-center"
                  )}
                >
                  <item.icon className="h-6 w-6 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="ml-3 flex-1">{item.name}</span>
                  )}
                  {sidebarOpen && item.name === "Dashboard" && (
                    <div className={cn("ml-auto h-2 w-2 rounded-full", themeColors.notificationDot)}></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Theme toggle */}
        <div className={cn(
          "border-t p-4",
          themeColors.sidebarBorder,
          !sidebarOpen && "flex justify-center"
        )}>
          <Button
            variant="ghost"
            size={sidebarOpen ? "default" : "icon"}
            onClick={toggleTheme}
            className={cn(themeColors.text, themeColors.sidebarHover, sidebarOpen && "w-full justify-start")}
          >
            {isDarkMode ? 
              <><Sun className="h-5 w-5 mr-2" />{sidebarOpen && "Light Mode"}</> : 
              <><Moon className="h-5 w-5 mr-2" />{sidebarOpen && "Dark Mode"}</>
            }
          </Button>
        </div>

        {/* User profile section */}
        <div className={cn(
          "flex flex-col border-t p-4",
          themeColors.sidebarBorder,
          !sidebarOpen && "items-center"
        )}>
          <div className={cn(
            "flex items-center",
            sidebarOpen ? "space-x-3" : "flex-col space-y-2"
          )}>
            <Avatar className={cn("h-10 w-10 border-2", themeColors.avatarBorder)}>
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className={themeColors.avatarBackground}>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", themeColors.text)}>{user.name}</p>
                <p className={cn("text-xs truncate capitalize", themeColors.textMuted)}>{user.role}</p>
              </div>
            )}
          </div>
          
          {sidebarOpen ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("mt-4 w-full justify-start", themeColors.text, themeColors.sidebarHover)}
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
             se deconnecter
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("mt-4", themeColors.text, themeColors.sidebarHover)}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && windowWidth < 1024 && (
        <div 
          className="fixed inset-0 z-40 bg-black/50" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out relative z-10",
        sidebarOpen ? "lg:pl-64" : "lg:pl-20"
      )}>
        {/* Top navigation bar */}
        <div className={cn("border-b sticky top-0 z-30", themeColors.headerBackground, themeColors.sidebarBorder)}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <div className="flex lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={themeColors.text}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className="sr-only">{t('layout.openSidebar')}</span>
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>

             
              <h1 className={cn("text-xl font-semibold", themeColors.text)}>
                {filteredNavigation.find(item => item.href === location.pathname)?.name || t('layout.dashboard')}
              </h1>

              
              <div className="flex items-center gap-4">
              

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Link to="/profile">
                      <Button variant="ghost" className={cn("relative flex items-center gap-2 h-8", themeColors.text, themeColors.sidebarHover)}>
                        <Avatar className={cn("h-8 w-8 border", themeColors.avatarBorder)}>
                          <AvatarImage src="" alt={user.name} />
                          <AvatarFallback className={themeColors.avatarBackground}>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <span className="hidden md:block font-medium text-sm">{user.name}</span>
                      </Button>
                    </Link>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={cn("w-56", themeColors.dropdownBackground)}>
                    <DropdownMenuLabel className={themeColors.text}>{t('layout.myAccount')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className={cn("cursor-pointer", themeColors.dropdownHover, "text-white")} onSelect={() => navigate('/profile')}>
                      {t('layout.profile')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className={cn("cursor-pointer", themeColors.dropdownHover, "text-white")} onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('layout.signOut')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className={cn("flex-1 p-4 sm:p-6 lg:p-8", themeColors.contentBackground)}>
        
          <div className={cn("rounded-lg p-6 shadow-xl", themeColors.panelBackground)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
