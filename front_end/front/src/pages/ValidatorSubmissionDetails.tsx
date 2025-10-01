import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import Layout from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Label } from 'recharts';

// Helper function to safely format dates (keep comment in English)
const safeFormatDate = (dateString) => {
  if (!dateString) return 'Aucune date disponible'; // Translated
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Date invalide'; // Translated
    
    return format(date, 'PPpp'); // Date with time
  } catch (error) {
    console.error('Erreur de formatage de date:', error); // Translated error message
    return 'Date invalide'; // Translated
  }
};

const ValidatorSubmissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Add a cleanup flag to prevent state updates after unmount (keep comment)
    let isMounted = true;
    
    const fetchSubmissionDetails = async () => {
      if (!id) {
        if (isMounted) {
          setError("L'ID de la soumission est manquant"); // Translated
          setIsLoading(false);
        }
        return;
      }

      try {
        // Fetch submission details only once (keep comment)
        const response = await api.listSubmissionsForValidation();
        
        // Find the submission that matches the requested ID (keep comment)
        const submission = response.data.find(sub => sub.id.toString() === id.toString());
        
        // Only update state if component is still mounted (keep comment)
        if (isMounted) {
          if (submission) {
            setSubmissionData(submission);
            console.log("Données de la soumission:", submission); // Translated log
            console.log("Données du formulaire:", submission.form_data); // Translated log
          } else {
            throw new Error("Soumission non trouvée"); // Translated error
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de la soumission:", err); // Translated log
        if (isMounted) {
          setError("Échec du chargement des détails de la soumission"); // Translated
          toast({
            title: "Erreur", // Translated
            description: "Impossible de charger les détails de la soumission", // Translated
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSubmissionDetails();
    
    // Cleanup function to prevent state updates after unmount (keep comment)
    return () => {
      isMounted = false;
    };
  }, [id]); // Only depend on id (keep comment)

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      await api.validateFormSubmission(id, {
        status: 'validated',
        validated_at: new Date().toISOString()
      });
      
      navigate('/forms');
      
      // Update the local state (keep comment)
      setSubmissionData(prev => ({
        ...prev,
        status: 'validated',
        validated_at: new Date().toISOString()
      }));
      
      toast({
        title: "Succès", // Translated
        description: "La soumission a été validée avec succès", // Translated
      });
    } catch (error) {
      console.error('Erreur lors de la validation de la soumission:', error); // Translated log
      toast({
        title: "Erreur", // Translated
        description: "Impossible de valider la soumission", // Translated
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement des détails de la soumission...</span> {/* Translated */}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center py-12 text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!submissionData) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center py-12">
            <p>Aucune soumission trouvée</p> {/* Translated */}
          </div>
        </div>
      </Layout>
    );
  }

  // Destructure the form template and form data (keep comment)
  const { form_template, status, created_at, validated_at, user, form_data } = submissionData;
  
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/forms')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux formulaires {/* Translated */}
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {form_template?.title || "Formulaire sans titre"} {/* Translated default */}
            </h1>
          </div>
          
          <div className="flex space-x-4">
            {status === 'submitted' && (
              <Button 
                onClick={handleValidate}
                disabled={isValidating}
              >
                {isValidating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Valider la soumission {/* Translated */}
              </Button>
            )}
          </div>
        </div>
        
        {/* Submission details card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Détails de la soumission</CardTitle> {/* Translated */}
            <CardDescription>Informations sur cette soumission de formulaire</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Titre du formulaire</p> {/* Translated */}
                <p>{form_template?.title || "Formulaire sans titre"}</p> {/* Translated default */}
              </div>
              
              {form_template?.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p> {/* Translated */}
                  <p>{form_template.description}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Soumis par</p> {/* Translated */}
                <p>{user?.name || "Utilisateur inconnu"}</p> {/* Translated */}
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statut</p> {/* Translated */}
                <div className="mt-1">
                  {status === 'draft' && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-50">
                      Brouillon {/* Translated */}
                    </Badge>
                  )}
                  {status === 'submitted' && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-50">
                      Soumis {/* Translated */}
                    </Badge>
                  )}
                  {status === 'validated' && (
                    <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50">
                      Validé {/* Translated */}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Créé le</p> {/* Translated */}
                <p>{safeFormatDate(created_at)}</p>
              </div>
              
              {validated_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Validé le</p> {/* Translated */}
                  <p>{safeFormatDate(validated_at)}</p>
                </div>
              )}
              
              {/* Display Location Data */}
              {submissionData?.location_data && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Localisation</p> {/* Translated */}
                  <p>Latitude: {submissionData.location_data.latitude}</p>
                  <p>Longitude: {submissionData.location_data.longitude}</p>
                  <p>Précision: {submissionData.location_data.accuracy} mètres</p> {/* Translated */}
                  <p>Horodatage: {safeFormatDate(submissionData.location_data.timestamp)}</p> {/* Translated */}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Form content card */}
        <Card>
          <CardHeader>
            <CardTitle>Contenu du formulaire</CardTitle> {/* Translated */}
            <CardDescription>Données du formulaire soumis</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {form_template?.fields?.map((field) => {
                const fieldName = field.name;
                let value = form_data?.[fieldName];
                let contentToRender = null;


if (field.type === 'checkbox') {
 
  const selectedValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? [value]
      : [];

  
  const labels = selectedValues.map(val => {
    const opt = field.options.find(o => o.value === val);
    return opt ? opt.label : val;
  });

  contentToRender = labels.length
    ? labels.join(', ')
    : 'Aucune sélection';
}
else if (field.type === 'select' && typeof value === 'string') {
  const opt = field.options.find(o => o.value === value);
  contentToRender = opt ? opt.label : value;
}

                else if (field.type === 'date' && value) {
                  // Format date fields (keep comment)
                  contentToRender = value; // Display as is for now, can format later if needed (keep comment)
                }
                else if (field.type === 'datetime' && value) {
                  // Format datetime fields (keep comment)
                  contentToRender = safeFormatDate(value);
                }
                else if ((field.type === 'file' || field.type === 'image') && value && typeof value === 'string') {
                  // Handle file and image fields - display as a link, image, or embed PDF (keep comment)
                  const fileExtension = value.split('.').pop()?.toLowerCase();

                  if (field.type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) {
                    // Display as image if it's an image field or a common image file type (keep comment)
                    contentToRender = (
                      <img src={value} alt="Image téléversée" className="max-w-xs max-h-140 mt-2 rounded-md border" /> // Translated alt
                    );
                  } else if (fileExtension === 'pdf') {
                    // Embed PDF using object tag (keep comment)
                    contentToRender = (
                      <object data={value} type="application/pdf" width="100%" height="500px">
                        <p>
                          Votre navigateur ne prend pas en charge les PDF. {/* Translated */}
                          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">Télécharger le PDF</a>. {/* Translated */}
                        </p>
                      </object>
                    );
                  }
                   else {
                    // Display as a generic file link for other file types (keep comment)
                    contentToRender = (
                      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Voir le fichier {/* Translated */}
                      </a>
                    );
                  }
                }
                else if (value !== undefined && value !== null) {
                  // Handle text and other simple field types (keep comment)
                  contentToRender = String(value);
                } else {
                  contentToRender = "Aucune donnée"; // Translated
                }

                return (
                  <div key={fieldName} className="pb-4 border-b border-gray-100 last:border-b-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{field.label}</p>
                    <div className="whitespace-pre-wrap">{contentToRender}</div>
                    {field.description && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{field.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ValidatorSubmissionDetails;