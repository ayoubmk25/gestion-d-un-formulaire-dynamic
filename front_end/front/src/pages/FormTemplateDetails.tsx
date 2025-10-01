// src/pages/FormTemplateDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Loader2, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FieldOption {
  label: string;
  value: string;
}

interface FormField {
  name: string;
  label: string;
  type: string; // You might want to make this a union type of possible field types
  required?: boolean;
  options?: (string | FieldOption)[];
  placeholder?: string;
  rows?: number;
  min?: number;
  max?: number;
  defaultChecked?: boolean;
  defaultValue?: string;
  requiredToBeChecked?: boolean; // Added based on FormSubmission usage
}

interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  created_at: string;
}

const FormTemplateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApi();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Add this flag to prevent multiple API calls (keep comment)
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Guard clause to prevent the effect from running if data has already been loaded (keep comment)
    if (hasLoaded || !id) return;

    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        const response = await api.getFormTemplate(id);
        setTemplate(response.data);
        // Mark as loaded to prevent further API calls (keep comment)
        setHasLoaded(true);
      } catch (error) {
        console.error('Erreur lors du chargement du modèle:', error); // Translated error message
        toast({
          title: "Erreur lors du chargement du modèle", // Translated
          description: "Un problème est survenu lors du chargement des détails du modèle", // Translated
          variant: "destructive",
        });
        navigate('/form-templates');
      } finally {
        setIsLoading(false);
      }
    };
  
    loadTemplate();
    // Only include id in dependencies - deliberately omitting api and navigate (keep comment)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, hasLoaded]); 

  const handleAssignForm = () => {
    // Navigate to the assignment page, passing the template ID
    navigate(`/form-templates/assign/${id}`); // Updated navigation path
  };

  const handleEditTemplate = () => {
    if (id) {
      navigate(`/form-templates/${id}/edit`);
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
              <p className="text-muted-foreground">Chargement des détails du modèle...</p> {/* Translated */}
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
            <h2 className="text-xl font-semibold mb-2">Modèle non trouvé</h2> {/* Translated */}
            <p className="text-muted-foreground mb-6">Le modèle que vous recherchez n'existe pas ou vous n'avez pas l'autorisation de le consulter.</p> {/* Translated */}
            <Button onClick={() => navigate('/form-templates')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux modèles {/* Translated */}
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
          <Button variant="ghost" onClick={() => navigate('/form-templates')} className="mr-4">
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
                  <CardTitle>Détails du modèle</CardTitle> {/* Translated */}
                  <Badge variant="outline">
                    {/* Logic for pluralization */}
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
            
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FormTemplateDetails;
