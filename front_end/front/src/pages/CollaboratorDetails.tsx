import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft,
  Calendar, 
  Mail, 
  User,
  Shield,
  Edit, 
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

const CollaboratorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [collaborator, setCollaborator] = useState(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  
  // Get API methods from the hook
  const { getCollaborator, deactivateCollaborator } = useApi();

  useEffect(() => {
    // Load collaborator details from the API
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await getCollaborator(id);
        setCollaborator(response.data);
      } catch (error) {
        console.error('Error loading collaborator details:', error);
        toast({
          title: "Error loading collaborator details",
          description: "There was a problem loading the collaborator information.",
          variant: "destructive",
        });
        navigate('/collaborators');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getCollaborator, id, navigate]);

  const handleDeactivateCollaborator = () => {
    setDeactivateDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    try {
      await deactivateCollaborator(id);
      
      // Update local state
      setCollaborator(prev => ({
        ...prev,
        status: 'inactive'
      }));
      
      toast({
        title: "Collaborator deactivated",
        description: `${collaborator.name} has been deactivated`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error deactivating collaborator:', error);
      toast({
        title: "Error deactivating collaborator",
        description: "There was a problem deactivating this collaborator.",
        variant: "destructive",
      });
    } finally {
      setDeactivateDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-[500px] bg-muted rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!collaborator) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Collaborateur introuvable</h2>
            <p className="text-muted-foreground mt-2">Le collaborateur que vous recherchez n'existe pas ou vous n'avez pas la permission de le voir.</p>
            <Button className="mt-6" onClick={() => navigate('/collaborators')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux collaborateurs
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex items-center mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate('/collaborators')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{collaborator.name}</h1>
          {collaborator.is_active == true ? (
            <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50 ml-4">
              Actif
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 ml-4">
              Inactif
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations du collaborateur</CardTitle>
                <CardDescription>Détails sur ce collaborateur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Nom complet</h3>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-lg">{collaborator.name}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{collaborator.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Rôle</h3>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Badge variant="outline" className="capitalize">
                        {collaborator.role}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Date d'adhésion</h3>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{new Date(collaborator.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={() => navigate(`/collaborators/${id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier le collaborateur
                </Button>
                
                {collaborator.is_active == true && (
                  <Button 
                    variant="destructive" 
                    onClick={handleDeactivateCollaborator}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Désactiver
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Résumé de l'activité</CardTitle>
                <CardDescription>Aperçu de l'activité du collaborateur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Formulaires assignés</span>
                    <Badge variant="secondary">{collaborator.formsAssigned || 0}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Formulaires complétés</span>
                    <Badge variant="secondary">{collaborator.formsCompleted || 0}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Dernière activité</span>
                    <span className="text-sm">
                      {collaborator.lastActive 
                        ? new Date(collaborator.lastActive).toLocaleDateString() 
                        : 'Jamais'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Profil</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cela désactivera le compte de {collaborator?.name}. Il ne pourra plus se connecter ni accéder au système.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeactivate} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default CollaboratorDetails;