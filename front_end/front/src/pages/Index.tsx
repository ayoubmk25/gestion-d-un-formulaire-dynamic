import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30">
      <div className="animate-pulse">
        <div className="h-12 w-12 bg-primary/20 rounded-full mb-4 mx-auto"></div>
        <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
      </div>
    </div>
  );
};

export default Index;