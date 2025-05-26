import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/contexts/ServiceContext';
import { GlassCard } from '@/components/ui/glass-card';
import AppLayout from '@/components/AppLayout';
import { BookOpen, Lightbulb, Cpu, LineChart, Users, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Services: React.FC = () => {
  const { userServices, refreshServices, isLoading } = useServices();
  const navigate = useNavigate();

  useEffect(() => {
    refreshServices().catch(error => {
      toast({
        title: 'Error',
        description: 'Failed to load services. Please try again.',
        variant: 'destructive',
      });
    });
  }, []);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-12 w-12 text-green-600" />;
      case 'framework':
        return <Lightbulb className="h-12 w-12 text-blue-600" />;
      case 'transformation':
        return <LineChart className="h-12 w-12 text-purple-600" />;
      case 'architecture':
        return <Cpu className="h-12 w-12 text-orange-600" />;
      case 'advisory':
        return <Users className="h-12 w-12 text-red-600" />;
      default:
        return <BookOpen className="h-12 w-12 text-gray-600" />;
    }
  };

  const handleServiceClick = (service: any) => {
    if (service.type === 'course') {
      navigate('/courses');
    } else {
      navigate(`/services/${service.id}`);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Services</h1>
          <button
            onClick={() => refreshServices()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userServices.map((service) => {
            const isEnabled = userServices.some(s => s.id === service.id) && service.status === 'active';
            return (
              <GlassCard
                key={service.id}
                className={`p-6 transition-shadow ${isEnabled ? 'cursor-pointer hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => isEnabled && handleServiceClick(service)}
                tabIndex={isEnabled ? 0 : -1}
                aria-disabled={!isEnabled}
                style={isEnabled ? {} : { pointerEvents: 'none' }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  {getServiceIcon(service.type)}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mt-2">
                      {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{service.description}</p>
                {!isEnabled && (
                  <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {service.status !== 'active' ? 'Service is not active' : 'Not enabled for your account'}
                  </div>
                )}
                {isEnabled && service.type !== 'course' && (
                  <div className="mt-4 text-sm text-gray-500">
                    Click to view service details
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Services; 