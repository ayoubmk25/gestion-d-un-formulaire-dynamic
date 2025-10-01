
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi'; // Import useApi hook
import { toast } from './use-toast';

type DashboardData = { companies: Record<string, unknown>[] } | Record<string, unknown> | null;

export function useDashboard() {
  const { user } = useAuth();
  const api = useApi(); // Use the useApi hook
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || fetchingRef.current) return;
      
      // Set fetching flag to true to prevent duplicate calls
      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching dashboard data for role:', user.role);
        let response;
        
        if (user.role === 'root') {
          // For root user, fetch companies list
          response = await api.listCompanies();
          setDashboardData({
            companies: response.data,
          });
        } else if (user.role === 'administrator') {
          // For administrator, fetch dashboard stats
          response = await api.getAdminDashboardStats();
          setDashboardData(response.data);
        } else {
          // For technician and validator
          response = await api.getCollaboratorDashboardStats();
          setDashboardData(response.data);
        }
        
        console.log('Dashboard data fetched successfully');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        // Reset the fetching flag after a short delay to prevent immediate re-fetch
        setTimeout(() => {
          fetchingRef.current = false;
        }, 500);
      }
    };

    if (user) {
      fetchDashboardData();
    }
    
    // Cleanup function
    return () => {
      fetchingRef.current = false;
    };
  }, [user, api]); // Add api to the dependency array

  return {
    isLoading,
    dashboardData,
    error,
  };
}
