
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  return (
    <Button 
      variant="logout" 
      onClick={logout}
      className="flex items-center gap-2"
    >
      <span>Logout</span>
      <LogOut className="h-4 w-4" />
    </Button>
  );
};

export default LogoutButton;
