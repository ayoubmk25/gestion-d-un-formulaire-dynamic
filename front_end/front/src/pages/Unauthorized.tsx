import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-amber-100 p-4">
            <AlertTriangle className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Unauthorized Access</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page. This area requires different privileges.
        </p>
        {user && (
          <p className="text-sm text-muted-foreground mb-4">
            You are currently logged in as <strong>{user.name}</strong> with the role of <strong className="capitalize">{user.role}</strong>.
          </p>
        )}
        <div className="flex justify-center">
          <Button className="button-hover" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;