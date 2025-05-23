import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  // Get initials from user's name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <GlassCard variant="featured" className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <Avatar className="h-24 w-24 border-4 border-white/20">
              <AvatarFallback className="text-2xl bg-white/10 text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">{user.type}</p>
            </div>

            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <GlassCard variant="subtle" className="p-4">
                  <h3 className="text-sm font-medium text-gray-500">Role</h3>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{user.type}</p>
                </GlassCard>
                
                <GlassCard variant="subtle" className="p-4">
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </GlassCard>
              </div>

              <Button 
                variant="destructive" 
                className="w-full hover:bg-red-600"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default Profile; 