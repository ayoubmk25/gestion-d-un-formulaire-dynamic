import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi'; // Assuming useApi provides direct api access
import api from '@/services/api'; // Import api directly
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  fields: any[];
  created_at: string;
}

interface FieldOption {
  label: string;
  value: string;
}

const RootFormTemplateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const apiHook = useApi(); // Keep if needed for other actions, but fetch uses direct api
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (hasLoaded || !id) return;

    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        // Use direct api call assuming the endpoint exists
        const response = await api.get(`/root/form-templates/${id}`);
        setTemplate(response.data);
        setHasLoaded(true);
      } catch (error) {
        console.error('Erreur lors du chargement du modèle racine:', error); // Translated error message
        toast({
          title: "Erreur lors du chargement du modèle racine", // Translated
          description: "Un problème est survenu lors du chargement des détails du modèle racine", // Translated
          variant: "destructive",
        });
        navigate('/root/form-templates'); // Navigate back to root list
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, hasLoaded]); // Removed apiHook from dependencies

  const handleEditTemplate = () => {
    if (id) {
      navigate(`/root/form-templates/${id}/edit`); // Navigate to root edit page
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date inconnue'; // Translated
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide'; // Translated
      }
      return format(date, 'PPP'); // Standard date format
    } catch (error) {
      return 'Date invalide'; // Translated
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des détails du modèle racine...</p> {/* Translated */}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!template) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Modèle racine non trouvé</h2> {/* Translated */}
            <p className="text-muted-foreground mb-6">Le modèle racine que vous recherchez n'existe pas ou vous n'avez pas l'autorisation de le consulter.</p> {/* Translated */}
            <Button onClick={() => navigate('/root/form-templates')}> {/* Navigate back to root list */}
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux modèles racines {/* Translated */}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/root/form-templates')} className="mr-4"> {/* Navigate back to root list */}
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour {/* Translated */}
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{template.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Détails du modèle racine</CardTitle> {/* Translated */}
                  <Badge variant="outline">
                    {template.fields?.length || 0} champ{template.fields?.length !== 1 ? 's' : ''} {/* Translated "field(s)" */}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3> {/* Translated */}
                    <p className="mt-1">{template.description || 'Aucune description fournie'}</p> {/* Translated */}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Créé le</h3> {/* Translated */}
                    <p className="mt-1">{formatDate(template.created_at)}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-base font-medium mb-3">Champs du formulaire</h3> {/* Translated */}
                    {template.fields && template.fields.length > 0 ? (
                      <div className="space-y-4">
                        {template.fields.map((field, index) => (
                          <div key={index} className="p-4 border rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{field.label}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Champ {field.type.charAt(0).toUpperCase() + field.type.slice(1)} {/* Translated "Field" */}
                                  {field.required && ' (Requis)'} {/* Translated */}
                                </p>
                              </div>
                              <Badge>{field.name}</Badge>
                            </div>
                            
                            {field.options && field.options.length > 0 && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Options:</h5> {/* Translated */}
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {field.options.map((option: string | FieldOption, optIndex: number) => (
                                    <Badge key={optIndex} variant="secondary">
                                      {typeof option === 'string' ? option : option.label}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucun champ défini pour ce modèle</p> /* Translated */
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle> {/* Translated */}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={handleEditTemplate} className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier le modèle racine {/* Translated */}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RootFormTemplateDetails;
