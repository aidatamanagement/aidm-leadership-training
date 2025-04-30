
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to={user?.type === 'admin' ? '/admin' : '/dashboard'} className="text-xl font-bold">
            AIDM Leadership Training
          </Link>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline">Welcome, {user.name}</span>
              <Button 
                variant="outline" 
                onClick={logout} 
                className="text-white border-white hover:bg-primary-light hover:text-white"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
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
