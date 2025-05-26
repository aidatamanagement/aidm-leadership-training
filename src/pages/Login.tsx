import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a password reset token in the URL (in the hash fragment)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
      // Redirect to password reset page
      navigate('/password-reset', { replace: true });
      return;
    }
    
    // Regular redirect if user is already logged in
    if (isAuthenticated && user) {
      const redirectPath = user.type === 'admin' ? '/admin' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const success = await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/password-reset`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your inbox for a password reset link',
      });
      
      setShowForgotPassword(false);
    } catch (err: any) {
      toast({
        title: 'Password reset failed',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AIDM Client Portal</h1>
        <p className="text-gray-800">Sign in to access your account resources</p>
      </div>
      
      {!showForgotPassword ? (
        <GlassCard className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Login</h2>
            <p className="text-gray-800 mt-1">Enter your credentials to continue</p>
          </div>
          
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-medium">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                className="bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-green-600 focus:ring-green-600"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-900 font-medium">Password</Label>
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-gray-900 hover:text-green-700 transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  className="bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-green-600 focus:ring-green-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
              className="w-full bg-green-700 text-white hover:bg-green-800 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
        </GlassCard>
      ) : (
        <GlassCard className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Reset Password</h2>
            <p className="text-gray-800 mt-1">Enter your email to receive a password reset link</p>
          </div>
          
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
              <Label htmlFor="resetEmail" className="text-gray-900 font-medium">Email</Label>
                <Input 
                  id="resetEmail" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                className="bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-green-600 focus:ring-green-600"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                className="flex-1 bg-green-700 text-white hover:bg-green-800 transition-colors"
                  disabled={isResetLoading}
                >
                  {isResetLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-100"
                >
                  Back to Login
                </Button>
              </div>
            </form>
        </GlassCard>
      )}
    </div>
  );
};

export default Login;
