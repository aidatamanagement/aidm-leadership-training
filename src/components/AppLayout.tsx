import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { students } = useData();
  const location = useLocation();

  // Get initials from user's name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Get the courses link based on user type
  const getCoursesLink = () => {
    if (user?.type === 'admin') {
      return '/admin';
    } else if (user?.type === 'student') {
      const currentStudent = students.find(s => s.id === user.id);
      if (currentStudent && currentStudent.assignedCourses.length > 0) {
        return `/courses/${currentStudent.assignedCourses[0]}`;
      }
    }
    return '/dashboard';
  };

  // Define navigation items based on user type
  const getNavigationItems = () => {
    if (user?.type === 'admin') {
      return [
        { path: '/admin', label: 'Admin Dashboard' },
        { path: '/prompts', label: 'Prompts' },
      ];
    } else {
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/services', label: 'Services' },
        { path: '/prompts', label: 'Prompts' },
      ];
    }
  };

  const NAVIGATION_ITEMS = getNavigationItems();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 bg-white text-black shadow-md z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
          <Link to={user?.type === 'admin' ? '/admin' : '/dashboard'} className="text-xl font-bold">
              <img src="/images/logo.png" alt="AIDM Leadership Training Logo" className="h-8" />
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              {NAVIGATION_ITEMS.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-gray-600",
                    location.pathname === item.path ? "text-black" : "text-gray-600"
                  )}
                >
                  {item.label}
          </Link>
              ))}
            </nav>
          </div>
          
          {user && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="p-0 hover:bg-gray-100"
                asChild
              >
                <Link to="/profile">
                  <Avatar className="h-8 w-8 border-2 border-gray-200">
                    <AvatarFallback className="bg-gray-100 text-gray-800">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="container mx-auto px-4 py-2 flex justify-between">
            {NAVIGATION_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-gray-600",
                  location.pathname === item.path ? "text-black" : "text-gray-600"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      
      {/* Add padding-top to account for fixed header */}
      <main className="flex-grow container mx-auto px-4 py-8 mt-[88px] md:mt-[72px]">
        {children}
      </main>
      
      <footer className="bg-gray-100 py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600">
          &copy; {new Date().getFullYear()} AIDM Leadership Training. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
