import React from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '@/contexts/ServiceContext';
import { GlassCard } from '@/components/ui/glass-card';
import AppLayout from '@/components/AppLayout';
import { BookOpen, Lightbulb, Cpu, LineChart, Users } from 'lucide-react';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { services } = useServices();
  const service = services.find(s => s.id === id);

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

  if (!service) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Service not found</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GlassCard className="p-8">
          <div className="flex items-center space-x-6 mb-8">
            {getServiceIcon(service.type)}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mt-2">
                {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600 text-lg mb-6">{service.description}</p>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Overview</h2>
              <p className="text-gray-600">
                This is a demo page for the {service.title} service. The actual content and functionality
                will be implemented based on the specific requirements of each service type.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default ServiceDetail; 