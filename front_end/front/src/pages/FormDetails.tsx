import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { Loader2, ArrowLeft, CheckCircle2, FileEdit, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Helper function to safely format dates (keeping comments in English)
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

const FormDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isRefusing, setIsRefusing] = useState(false); // New state for refusing
  const [formData, setFormData] = useState(null);
  const [formType, setFormType] = useState(null); // 'submission' or 'assignment'
  const [userRole, setUserRole] = useState(null);
  
  // Try to use passed state data or fetch if not available (keeping comments in English)
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get user role (you might have this from your auth context)
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      setUserRole(userInfo.role);
      
      // If we have data from navigation state, use it
      if (location.state?.data) {
        setFormData(location.state.data);
        setFormType(location.state.type || determineFormType(location.state.data));
        setIsLoading(false);
        return;
      }
      
      // Try to determine if this is a submission or assignment
      // First check all submissions
      const submissionsResponse = await api.listSubmissions();
      const submission = submissionsResponse.data.find(sub => sub.id === id);
      
      if (submission) {
        setFormData(submission);
        setFormType('submission');
      } else {
        // If not a submission, check if it's an assigned form
        const templateRes = await api.getCollaboratorFormTemplate(id);
        setFormData(templateRes.data);
        setFormType('assignment');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails du formulaire:', error); // Translated error message
      toast({
        title: "Erreur", // Translated
        description: "Impossible de charger les détails du formulaire", // Translated
        variant: "destructive",
      });
      navigate('/forms');
    } finally {
      setIsLoading(false);
    }
  }, [id, location.state, api, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Helper function to determine if data is a submission or assignment (keeping comments in English)
  const determineFormType = (data) => {
    return data.status !== undefined ? 'submission' : 'assignment';
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      await api.validateFormSubmission(id, {
        status: 'validated',
        validated_at: new Date().toISOString()
      });
      
      // Update the local state
      setFormData(prev => ({
        ...prev,
        status: 'validated',
        validated_at: new Date().toISOString()
      }));
      
      toast({
        title: "Succès", // Translated
        description: "Le formulaire a été validé avec succès", // Translated
      });
    } catch (error) {
      console.error('Erreur lors de la validation du formulaire:', error); // Translated error message
      toast({
        title: "Erreur", // Translated
        description: "Impossible de valider le formulaire", // Translated
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRefuse = async () => {
    setIsRefusing(true);
    try {
      await api.refuseFormSubmission(id, {
        status: 'refused',
        refused_at: new Date().toISOString() // Using a new field for clarity, though backend reuses validated_at
      });
      
      // Update the local state
      setFormData(prev => ({
        ...prev,
        status: 'refused',
        validated_at: new Date().toISOString() // Backend reuses validated_at for refused_at
      }));
      
      toast({
        title: "Succès", // Translated
        description: "Le formulaire a été refusé avec succès", // Translated
      });
    } catch (error) {
      console.error('Erreur lors du refus du formulaire:', error); // Translated error message
      toast({
        title: "Erreur", // Translated
        description: "Impossible de refuser le formulaire", // Translated
        variant: "destructive",
      });
    } finally {
      setIsRefusing(false);
    }
  };
  
  const handleEdit = () => {
    // Only allow editing draft submissions
    if (formData.status === 'draft') {
      navigate(`/form-submission/edit/${id}`);
    } else {
      toast({
        title: "Modification impossible", // Translated
        description: "Ce formulaire ne peut plus être modifié", // Translated
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement des détails du formulaire...</span> {/* Translated */}
          </div>
        </div>
      </Layout>
    );
  }

  // Determine if this is a submission or an assignment template (keeping comments in English)
  const isSubmission = formType === 'submission';
  
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
              {formData?.title || formData?.form_template?.title || "Formulaire sans titre"} {/* Translated default */}
            </h1>
          </div>
          
          <div className="flex space-x-4">
            {isSubmission && formData.status === 'draft' && (
              <Button 
                onClick={handleEdit}
              >
                <FileEdit className="mr-2 h-4 w-4" />
                Modifier le formulaire {/* Translated */}
              </Button>
            )}
            
            {isSubmission && 
             formData.status === 'submitted' && 
             userRole === 'validator' && (
              <>
                <Button 
                  variant="destructive" // Use a destructive variant for refuse
                  onClick={handleRefuse}
                  disabled={isRefusing}
                >
                  {isRefusing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="mr-2 h-4 w-4" /> // Using AlertTriangle for refuse
                  )}
                  Refuser le formulaire {/* Translated */}
                </Button>
                <Button 
                  onClick={handleValidate}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Valider le formulaire {/* Translated */}
                </Button>
              </>
            )}
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Détails du formulaire</CardTitle> {/* Translated */}
            <CardDescription>
              {isSubmission ? 'Informations de la soumission' : 'Informations du modèle'} {/* Translated */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Titre du formulaire</p> {/* Translated */}
                <p>{formData?.title || formData?.form_template?.title || "Formulaire sans titre"}</p> {/* Translated default */}
              </div>
              
              {formData.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p> {/* Translated */}
                  <p>{formData.description}</p>
                </div>
              )}
              
              {isSubmission && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Statut</p> {/* Translated */}
                    <div className="mt-1">
                      {formData.status === 'draft' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-50">
                          Brouillon {/* Translated */}
                        </Badge>
                      )}
                      {formData.status === 'submitted' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-50">
                          Soumis {/* Translated */}
                        </Badge>
                      )}
                      {formData.status === 'validated' && (
                        <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50">
                          Validé {/* Translated */}
                        </Badge>
                      )}
                      {formData.status === 'refused' && (
                        <Badge variant="outline" className="bg-red-50 text-red-800 hover:bg-red-50">
                          Refusé {/* Translated */}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Créé le</p> {/* Translated */}
                    <p>{safeFormatDate(formData.created_at || formData.created_at)}</p>
                  </div>
                  
                  {(formData.submitted_at || formData.submittedAt) && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Soumis le</p> {/* Translated */}
                      <p>{safeFormatDate(formData.submitted_at || formData.submittedAt)}</p> {/* Corrected variable access */}
                    </div>
                  )}
                  
                  {(formData.validated_at || formData.validatedAt) && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Validé le</p> {/* Translated */}
                      <p>{safeFormatDate(formData.validated_at || formData.validated_at)}</p>
                    </div>
                  )}
                </>
              )}
              
              {!isSubmission && formData.due_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d'échéance</p> {/* Translated */}
                  <p>{safeFormatDate(formData.due_date)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Display form content if this is a submission */}
        {isSubmission && formData.content && (
          <Card>
            <CardHeader>
              <CardTitle>Contenu du formulaire</CardTitle> {/* Translated */}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(formData.content).map(([key, value]) => (
                  <div key={key} className="pb-4 border-b border-gray-100 last:border-b-0">
                    {/* Keep the key as is, as it's dynamic data */}
                    <p className="text-sm font-medium text-muted-foreground mb-1">{key}</p> 
                    <p className="whitespace-pre-wrap">{String(value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default FormDetails;
