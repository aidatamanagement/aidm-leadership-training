import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Service {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'framework' | 'transformation' | 'architecture' | 'advisory';
  status: 'active' | 'inactive';
}

interface ServiceContextType {
  services: Service[];
  userServices: Service[];
  refreshServices: () => Promise<void>;
  isLoading: boolean;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchUserServices = async () => {
    if (!user) {
      setUserServices([]);
      return;
    }

    try {
      // First get the user_services entries
      const { data: userServiceData, error: userServiceError } = await supabase
        .from('user_services')
        .select('service_id')
        .eq('user_id', user.id);

      if (userServiceError) throw userServiceError;

      if (!userServiceData || userServiceData.length === 0) {
        setUserServices([]);
        return;
      }

      // Then get the actual service details
      const serviceIds = userServiceData.map(entry => entry.service_id);
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .in('id', serviceIds)
        .eq('status', 'active');

      if (serviceError) throw serviceError;
      
      // Filter out any null or undefined services
      const validServices = serviceData?.filter(service => service && service.id) || [];
      setUserServices(validServices);
    } catch (error) {
      console.error('Error fetching user services:', error);
      setUserServices([]);
    }
  };

  const refreshServices = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchServices(), fetchUserServices()]);
    } catch (error) {
      console.error('Error refreshing services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshServices();
  }, [user]);

  return (
    <ServiceContext.Provider value={{ services, userServices, refreshServices, isLoading }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}; 