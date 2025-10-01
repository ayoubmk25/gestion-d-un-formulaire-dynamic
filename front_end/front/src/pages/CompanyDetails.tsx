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
  BuildingIcon, 
  Calendar, 
  Users, 
  FileText,
  Edit, 
  XCircle, 
  ArrowLeft,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  
  // Get API methods from the hook
  const { getCompany, deactivateCompany } = useApi();

  useEffect(() => {
    // Load company details from the API
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await getCompany(id);
        setCompany(response.data);
      } catch (error) {
        console.error('Error loading company details:', error);
        toast({
          title: "Erreur lors du chargement des détails de la société", // Translated
          description: "Un problème est survenu lors du chargement des informations de la société.", // Translated
          variant: "destructive",
        });
        navigate('/companies');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getCompany, id, navigate]);

  const handleDeactivateCompany = () => {
    setDeactivateDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    try {
      await deactivateCompany(id);
      
      // Update local state
      setCompany(prev => ({
        ...prev,
        is_active: false
      }));
      
      toast({
        title: "Société désactivée", // Translated
        description: `${company.name} a été désactivée`, // Translated (with variable)
        variant: "default",
      });
    } catch (error) {
      console.error('Error deactivating company:', error);
      toast({
        title: "Erreur lors de la désactivation de la société", // Translated
        description: "Un problème est survenu lors de la désactivation de cette société.", // Translated
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
          {/* Skeleton Loader - No text to translate here */}
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-[500px] bg-muted rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Société non trouvée</h2> {/* Translated */}
            <p className="text-muted-foreground mt-2">La société que vous recherchez n'existe pas ou vous n'avez pas l'autorisation de la consulter.</p> {/* Translated */}
            <Button className="mt-6" onClick={() => navigate('/companies')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux sociétés {/* Translated */}
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
          <Button variant="outline" size="sm" onClick={() => navigate('/companies')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour {/* Translated */}
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          {company.is_active ? (
            <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50 ml-4">
              Actif {/* Translated */}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 ml-4">
              Inactif {/* Translated */}
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations sur la société</CardTitle> {/* Translated */}
                <CardDescription>Détails concernant cette société</CardDescription> {/* Translated */}
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Nom de la société</h3> {/* Translated */}
                  <p className="text-lg">{company.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">E-mail</h3> {/* Translated */}
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{company.email}</p>
                  </div>
                </div>
                
                {company.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Téléphone</h3> {/* Translated */}
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{company.phone}</p>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Créé le</h3> {/* Translated */}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{new Date(company.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Statut</h3> {/* Translated */}
                    <div>
                      {company.is_active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50">
                          Actif {/* Translated */}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          Inactif {/* Translated */}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={() => navigate(`/companies/${id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier la société {/* Translated */}
                </Button>
                
                {company.is_active && (
                  <Button 
                    variant="destructive" 
                    onClick={handleDeactivateCompany}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Désactiver {/* Translated */}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ressources</CardTitle> {/* Translated */}
                <CardDescription>Allocation des ressources de la société</CardDescription> {/* Translated */}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>Utilisateurs</span> {/* Translated */}
                  </div>
                  <Badge variant="secondary">{company.max_users}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>Formulaires disponibles</span> {/* Translated */}
                  </div>
                  <Badge variant="secondary">{company.abonnements?.[0]?.available_forms ?? 0}</Badge> {/* Use abonnement data */}
                </div>
                
                <div className="flex justify-between items-center"> {/* New section for Forms to Create */}
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>Formulaires à créer</span> {/* Translated */}
                  </div>
                  <Badge variant="secondary">{company.abonnements?.[0]?.forms_to_create ?? 0}</Badge> {/* Use abonnement data */}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Icône de la société</CardTitle> {/* Translated */}
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <BuildingIcon className="h-12 w-12 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle> {/* Translated */}
            <AlertDialogDescription>
              Ceci désactivera {company?.name}. Tous les utilisateurs de cette société perdront l'accès au système. {/* Translated (with variable) */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel> {/* Translated */}
            <AlertDialogAction 
              onClick={confirmDeactivate} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Désactiver {/* Translated */}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default CompanyDetails;