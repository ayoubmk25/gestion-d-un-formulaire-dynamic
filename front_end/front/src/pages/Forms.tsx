import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext'; 
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  FileEdit, 
  CalendarIcon,
  CheckCircle2,
  ClipboardList,
  FileText,
  PlusCircle,
  Eye,
  Users,
  AlertTriangle // Import AlertTriangle for the refuse button
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';
// import { title } from 'process'; // Removed unused import

// Helper function to safely format dates (keep comments in English, translate UI text)
const safeFormatDate = (dateString) => {
  if (!dateString) return 'Aucune date disponible'; // Translated
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Date invalide'; // Translated
    
    return format(date, 'PP'); // Standard date format
  } catch (error) {
    console.error('Erreur de formatage de date:', error); // Translated error message
    return 'Date invalide'; // Translated
  }
};

const Forms = () => {
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]); // For validators to see all submissions
  
  // Use a ref to track if we've already loaded data to prevent multiple API calls (keep comment)
  const dataLoaded = useRef(false);

  // Check if user is a validator (keep comment)
  const isValidator = user?.role === 'validator';

  useEffect(() => {
    // Only load data if it hasn't been loaded already (keep comment)
    if (dataLoaded.current) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log("Chargement des données des formulaires..."); // Translated log message
        
        // Using Promise.all to fetch all data in parallel (keep comment)
        const apiCalls = [
          api.listAssignedForms(), // All users can have assigned forms now
          api.listSubmissions()    // Get user's own submissions
        ];
        
        // If validator, get submissions for validation and refused submissions as well (keep comment)
        if (isValidator) {
          apiCalls.push(api.listSubmissionsForValidation()); // Get submissions for validation
          apiCalls.push(api.listRefusedSubmissionsForValidator()); // Get refused submissions for validators
        }
        
        const responses = await Promise.all(apiCalls);
        
        // Set state with the retrieved data (keep comment)
        setAssignments(responses[0].data || []);
        setSubmissions(responses[1].data || []);
        
        // If validator, set submissions for validation and refused submissions (keep comment)
        if (isValidator) {
          setAllSubmissions([...(responses[2]?.data || []), ...(responses[3]?.data || [])]); // Combine submissions for validation and refused submissions
        }
        
        // Mark data as loaded (keep comment)
        dataLoaded.current = true;
        console.log("Données des formulaires chargées avec succès"); // Translated log message
      } catch (error) {
        console.error('Erreur lors du chargement des données des formulaires:', error); // Translated error message
        toast({
          title: "Erreur lors du chargement des données", // Translated
          description: "Un problème est survenu lors du chargement de vos formulaires", // Translated
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Cleanup function to handle component unmount (keep comment)
    return () => {
      console.log("Démontage du composant Forms"); // Translated log message
    };
  }, [isValidator]); // Add isValidator to dependencies to reload data if role changes

  const handleStartForm = async (assignmentId) => {
    try {
      // Check if the assignment exists
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        throw new Error("Assignation non trouvée"); // Translated error
      }
      
      // Use the formTemplateId from the assignment if available
      const formTemplateId = assignment.formTemplateId || assignment.form_template?.id;
      
      if (!formTemplateId) {
        throw new Error("ID du modèle de formulaire non trouvé"); // Translated error
      }
      
      // Navigate to the form submission page with the template ID
      navigate(`/form-submission/new/${formTemplateId}`);
    } catch (error) {
      console.error('Erreur lors du démarrage du formulaire:', error); // Translated error message
      toast({
        title: "Erreur", // Translated
        description: "Impossible de démarrer le formulaire. Veuillez réessayer plus tard.", // Translated
        variant: "destructive",
      });
    }
  };

  const handleContinueEditing = (submissionId) => {
    try {
      // Find the submission in our local state
      const submission = isValidator 
        ? allSubmissions.find(s => s.id === submissionId) || submissions.find(s => s.id === submissionId)
        : submissions.find(s => s.id === submissionId);
      
      if (submission) {
        // Pass the submission data through the navigation state
        navigate(`/form-submission/edit/${submissionId}`, {
          state: { submissionData: submission }
        });
      } else {
        toast({
          title: "Erreur", // Translated
          description: "Détails de la soumission introuvables", // Translated
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la navigation vers la soumission:', error); // Translated error message
      toast({
        title: "Erreur", // Translated
        description: "Impossible d'ouvrir la soumission du formulaire", // Translated
        variant: "destructive",
      });
    }
  };
  
  const handleViewDetails = (submissionId) => {
    try {
      // First get the submission details
      const submission = isValidator
        ? allSubmissions.find(s => s.id === submissionId) || submissions.find(s => s.id === submissionId)
        : submissions.find(s => s.id === submissionId);
        
      if (submission) {
        navigate(`/forms/${submissionId}`, { 
          state: { 
            type: 'submission',
            data: submission 
          }
        });
      } else {
        toast({
          title: "Erreur", // Translated
          description: "Détails de la soumission introuvables", // Translated
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la visualisation de la soumission:', error); // Translated error message
      toast({
        title: "Erreur", // Translated
        description: "Impossible de visualiser les détails de la soumission", // Translated
        variant: "destructive",
      });
    }
  };
  
  const handleViewAssignment = (assignmentId) => {
    try {
      // Get the assignment details from the local state rather than making an API call
      const assignment = assignments.find(a => a.id === assignmentId);
      
      if (!assignment) {
        throw new Error("Assignation non trouvée"); // Translated error
      }
      
      // Navigate to the assignment details page with the data
      navigate(`/forms/${assignmentId}`, {
        state: {
          type: 'assignment',
          data: assignment
        }
      });
    } catch (error) {
      console.error('Erreur lors de la visualisation de l\'assignation:', error); // Translated error message
      toast({
        title: "Erreur", // Translated
        description: "Impossible de visualiser les détails de l'assignation. Veuillez réessayer plus tard.", // Translated
        variant: "destructive",
      });
    }
  };
  
  // Handler to validate a form submission (validator-only)
  const handleValidateSubmission = async (submissionId: string) => { // Explicitly type submissionId
    try {
      // Use the correct API call for validation
      await api.validateFormSubmission(submissionId, {
        status: 'validated',
        validated_at: new Date().toISOString(),
        validator_id: user.id // Include the validator's ID
      });
      
      // Update both local states to reflect the validation
      const updateSubmissionState = (submissionsList) => {
        return submissionsList.map(submission => 
          submission.id === submissionId 
            ? { ...submission, status: 'validated', validated_at: new Date().toISOString() } 
            : submission
        );
      };
      
      setSubmissions(updateSubmissionState(submissions));
      if (isValidator) {
        setAllSubmissions(updateSubmissionState(allSubmissions));
      }
      
      toast({
        title: "Succès", // Translated
        description: "Le formulaire a été validé avec succès", // Translated
        variant: "default",
      });
    } catch (error) {
      console.error('Erreur lors de la validation de la soumission:', error); // Translated error message
      toast({
        title: "Erreur", // Translated
        description: error.response?.data?.message || "Impossible de valider la soumission du formulaire", // Translated
        variant: "destructive",
      });
    }
  };

  // Handler to refuse a form submission (validator-only)
  const handleRefuseSubmission = async (submissionId: string) => {
    try {
      await api.refuseFormSubmission(submissionId, {
        status: 'refused',
        refused_at: new Date().toISOString(),
        validator_id: user.id // Include the validator's ID
      });

      // Update both local states to reflect the refusal
      const updateSubmissionState = (submissionsList) => {
        return submissionsList.map(submission => 
          submission.id === submissionId 
            ? { ...submission, status: 'refused', validated_at: new Date().toISOString() } // Backend reuses validated_at
            : submission
        );
      };
      
      setSubmissions(updateSubmissionState(submissions));
      if (isValidator) {
        setAllSubmissions(updateSubmissionState(allSubmissions));
      }

      toast({
        title: "Succès", // Translated
        description: "Le formulaire a été refusé avec succès", // Translated
        variant: "default",
      });
    } catch (error) {
      console.error('Erreur lors du refus de la soumission:', error); // Translated error message
      toast({
        title: "Erreur", // Translated
        description: error.response?.data?.message || "Impossible de refuser la soumission du formulaire", // Translated
        variant: "destructive",
      });
    }
  };
  
  // New handler to navigate to create a new form submission (keep comment)

  // New handler to navigate to a page showing all submissions (validator-only) (keep comment)

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          {/* Skeleton Loader - No visible text */}
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Group user's own submissions by status (keep comment)
  const pendingSubmissions = submissions.filter(s => s.status === 'draft' || s.status === 'submitted');
  const validatedSubmissions = submissions.filter(s => s.status === 'validated');
  const refusedSubmissions = submissions.filter(s => s.status === 'refused'); // New: Filter for refused submissions

  // For validators - get submissions for validation from the state populated by listSubmissionsForValidation (keep comment)
  const submissionsForValidation = isValidator
    ? allSubmissions.filter(s => s.status === 'submitted') // Filter by status 'submitted' as per API
    : [];
  const validatorRefusedSubmissions = isValidator
    ? allSubmissions.filter(s => s.status === 'refused') // New: Filter for refused submissions for validators
    : [];

  // Get pending assignments (all assigned forms that haven't been validated) (keep comment)
  // Collaborators can now submit multiple times for the same assignment if needed, (keep comment)
  // so we don't filter based on existing submissions. (keep comment)
  const pendingAssignments = assignments.filter(assignment => 
    assignment.status !== 'validated' // Assuming assignments have a status field
  );

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {isValidator ? 'Tableau de bord Formulaires & Validation' : 'Formulaires'} {/* Translated */}
          </h1>
          
         
          
        </div>
        
        <Tabs defaultValue={isValidator ? "toValidate" : "assigned"} className="w-full">
          <TabsList className="mb-6">
            {/* Show assigned forms tab for all users */}
            <TabsTrigger value="assigned">
              Formulaires Assignés {/* Translated */}
              <Badge variant="secondary" className="ml-2">
                {pendingAssignments.length}
              </Badge>
            </TabsTrigger>
            
            {/* My Forms tab for all users */}
            <TabsTrigger value="pending">
              Mes Formulaires {/* Translated */}
              <Badge variant="secondary" className="ml-2">
                {pendingSubmissions.length}
              </Badge>
            </TabsTrigger>
            
            {/* Special tab for validators to see submissions to validate */}
            {isValidator && (
              <TabsTrigger value="toValidate">
                À Valider {/* Translated */}
                <Badge variant="secondary" className="ml-2">
                  {submissionsForValidation.length}
                </Badge>
              </TabsTrigger>
            )}
            
            <TabsTrigger value="validated">
              Validés {/* Translated */}
              <Badge variant="secondary" className="ml-2">
                {validatedSubmissions.length}
              </Badge>
            </TabsTrigger>

            {/* New tab for refused forms */}
            <TabsTrigger value="refused">
              Refusés {/* Translated */}
              <Badge variant="secondary" className="ml-2">
                {isValidator ? validatorRefusedSubmissions.length : refusedSubmissions.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          {/* Assigned Forms Tab (for all users) */}
          <TabsContent value="assigned">
            {pendingAssignments.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune assignation de formulaire en attente</h3> {/* Translated */}
                <p className="text-muted-foreground">Vous avez complété tous vos formulaires assignés.</p> {/* Translated */}
                
              
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {pendingAssignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle>{assignment.form_template?.title || assignment.title || "Formulaire sans titre"}</CardTitle> {/* Translated default */}
                      <CardDescription>
                        Assigné le {safeFormatDate(assignment.created_at)} {/* Translated */}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>Échéance: {assignment.due_date ? safeFormatDate(assignment.due_date) : 'Aucune échéance'}</span> {/* Translated */}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <FileEdit className="mr-2 h-4 w-4" />
                          <span>Statut: Non commencé</span> {/* Translated */}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <Button 
                        className="w-full" 
                        onClick={() => handleStartForm(assignment.id)}
                      >
                        Commencer le formulaire {/* Translated */}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleViewAssignment(assignment.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails {/* Translated */}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* My Forms Tab - for both validator and technician */}
          <TabsContent value="pending">
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <FileEdit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun formulaire en cours</h3> {/* Translated */}
                <p className="text-muted-foreground">Vous n'avez aucun formulaire partiellement complété.</p> {/* Translated */}
                
               
                
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingSubmissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle>
                        {submission.form_template_title || "Formulaire sans titre"} {/* Translated default */}
                      </CardTitle>
                      <CardDescription>
                        Dernière mise à jour: {safeFormatDate(submission.updated_at || submission.updatedAt)} {/* Translated */}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Commencé le {safeFormatDate(submission.created_at || submission.createdAt)}</span> {/* Translated */}
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-50">
                            {submission.status === 'draft' ? 'Brouillon' : 'Soumis'} {/* Translated */}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <Button 
                        className="w-full" 
                        onClick={() => handleContinueEditing(submission.id)}
                      >
                        {submission.status === 'draft' ? 'Continuer la modification' : 'Voir la soumission'} {/* Translated */}
                      </Button>
                      
                      {submission.status === 'submitted' && (
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => handleViewDetails(submission.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir les détails {/* Translated */}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* To Validate Tab - only for validators */}
          {isValidator && (
            <TabsContent value="toValidate">
              {submissionsForValidation.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun formulaire en attente de validation</h3> {/* Translated */}
                  <p className="text-muted-foreground">Il n'y a aucun formulaire en attente de votre validation.</p> {/* Translated */}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {submissionsForValidation.map((submission) => (
                    <Card key={submission.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle>
                          {submission.form_template.title || "Formulaire sans titre"} {/* Translated default */}
                        </CardTitle>
                        <CardDescription>
                          {submission.user?.name && (
                            <span className="block text-sm font-medium">
                              Soumis par: {submission.user.name} {/* Translated */}
                            </span>
                          )}
                          Soumis le: {safeFormatDate(submission.updated_at || submission.updatedAt)} {/* Translated */}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="mr-2 h-4 w-4" />
                            <span>ID Utilisateur: {submission.user_id || submission.userId || 'Inconnu'}</span> {/* Translated */}
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-50">
                              En attente de validation {/* Translated */}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        {/* Button to view submission content */}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/validator/submissions/${submission.id}`)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Voir le contenu {/* Translated */}
                        </Button>

                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => handleValidateSubmission(submission.id)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Valider {/* Translated */}
                        </Button>
                        <Button
                          variant="destructive" // Use a destructive variant for refuse
                          className="w-full"
                          onClick={() => handleRefuseSubmission(submission.id)}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Refuser {/* Translated */}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Validated Tab */}
          <TabsContent value="validated">
            {validatedSubmissions.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun formulaire validé</h3> {/* Translated */}
                <p className="text-muted-foreground">
                  {isValidator 
                    ? "Vous n'avez encore validé aucun formulaire." 
                    : "Vous n'avez pas encore de formulaires validés."} {/* Translated */}
                </p>
                
               
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {validatedSubmissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle>
                        {submission.form_template_title || "Formulaire sans titre"} {/* Translated default */}
                      </CardTitle>
                      <CardDescription>
                        Validé le {safeFormatDate(submission.validated_at || submission.validatedAt || submission.updated_at || submission.updatedAt)} {/* Translated */}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>
                            Soumis le {safeFormatDate(submission.submitted_at || submission.submittedAt || submission.created_at || submission.createdAt)} {/* Translated */}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50">
                            Validé {/* Translated */}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleViewDetails(submission.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails {/* Translated */}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Refused Tab - for both validator and technician */}
          <TabsContent value="refused">
            {(isValidator ? validatorRefusedSubmissions : refusedSubmissions).length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun formulaire refusé</h3> {/* Translated */}
                <p className="text-muted-foreground">
                  {isValidator 
                    ? "Vous n'avez refusé aucun formulaire." 
                    : "Vous n'avez aucun formulaire refusé."} {/* Translated */}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(isValidator ? validatorRefusedSubmissions : refusedSubmissions).map((submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle>
                        {submission.form_template_title || "Formulaire sans titre"} {/* Translated default */}
                      </CardTitle>
                      <CardDescription>
                        Refusé le {safeFormatDate(submission.refused_at || submission.refusedAt || submission.updated_at || submission.updatedAt)} {/* Translated */}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>
                            Soumis le {safeFormatDate(submission.submitted_at || submission.submittedAt || submission.created_at || submission.createdAt)} {/* Translated */}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="bg-red-50 text-red-800 hover:bg-red-50">
                            Refusé {/* Translated */}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleViewDetails(submission.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails {/* Translated */}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Forms;
