
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isLoading: authLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect if user is already logged in
    if (isAuthenticated && user) {
      navigate(user.type === 'admin' ? '/admin' : '/dashboard');
    }

    // Check if we're on the login page because of a password reset redirect
    const accessToken = new URLSearchParams(location.hash.substring(1)).get('access_token');
    const type = new URLSearchParams(location.hash.substring(1)).get('type');
    
    if (accessToken && type === 'recovery') {
      // Redirect to password reset page with the token
      navigate(`/password-reset?token=${accessToken}`);
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for a link to reset your password',
      });
      
      setIsResetMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsResetMode(!isResetMode);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">AIDM Leadership Training</h1>
        <p className="text-gray-600">Sign in to access your training materials</p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            {isResetMode ? 'Reset Password' : 'Login'}
          </CardTitle>
          <CardDescription>
            {isResetMode 
              ? 'Enter your email to receive a password reset link' 
              : 'Enter your credentials to continue'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isResetMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input 
                  id="reset-email" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-light"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button 
                    type="button" 
                    onClick={toggleMode} 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-light"
                disabled={authLoading}
              >
                {authLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <button 
            type="button" 
            onClick={toggleMode}
            className="text-sm text-primary hover:underline"
          >
            {isResetMode ? 'Back to login' : ''}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
