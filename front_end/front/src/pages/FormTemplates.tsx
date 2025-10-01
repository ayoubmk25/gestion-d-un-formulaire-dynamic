import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import Layout from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ClipboardList, 
  FilePlus, 
  UserPlus, 
  PlusCircle, 
  Search,
  Calendar,
  Users,
  Trash2,
  Loader2,
  Filter,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/contexts/AuthContext';

// Define types for better type safety (keep types in English)
interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  fields: any[];
  created_at: string;
  origin?: 'created' | 'assigned'; // Add origin property
}

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

interface FormAssignment {
  id: string;
  formTemplateId: string;
  assigneeEmail: string;
  status: string;
  dueDate?: string;
  createdAt: string;
}

interface Collaborator {
  id: string;
  email: string;
  name?: string;
  role: string;
  selected: boolean;
}

const FormTemplates = () => {
  const navigate = useNavigate();
  const api = useApi();
  const [templates, setTemplates] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchCollaboratorTerm, setSearchCollaboratorTerm] = useState('');
  const [showValidatorAssignDialog, setShowValidatorAssignDialog] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [validators, setValidators] = useState<Collaborator[]>([]);
  const [technicians, setTechnicians] = useState<Collaborator[]>([]);
  const [selectedValidatorId, setSelectedValidatorId] = useState<string | null>(null);
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>([]);
  const [selectedTemplateForValidatorAssign, setSelectedTemplateForValidatorAssign] = useState<FormTemplate | null>(null);
  const [isAssigningValidator, setIsAssigningValidator] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';

  // Helper function to safely format dates (keep comment in English)
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue'; // Translated
    
    try {
      // Try to parse the date string
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Date invalide'; // Translated
      }
      
      return format(date, 'PP'); // Standard date format
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error); // Translated error message
      return 'Date invalide'; // Translated
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await api.listFormTemplates();
      console.log('Réponse API des modèles:', response); // Translated log
      // Check if response.data exists, otherwise use an empty array
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error); // Translated log
      // Set templates to empty array on error
      setTemplates([]);
      toast({
        title: "Erreur lors du chargement des modèles", // Translated
        description: "Un problème est survenu lors du chargement de vos modèles", // Translated
        variant: "destructive",
      });
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await api.listAssignments();
      console.log('Réponse API des assignations:', response); // Translated log
      // Check if response.data exists, otherwise use an empty array
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des assignations:', error); // Translated log
      // Set assignments to empty array on error
      setAssignments([]);
      toast({
        title: "Erreur lors du chargement des assignations", // Translated
        description: "Un problème est survenu lors du chargement de vos assignations", // Translated
        variant: "destructive",
      });
    }
  };

  const loadCollaborators = async () => {
    setIsLoadingCollaborators(true);
    try {
      const response = await api.listCollaborators();
      console.log('Réponse API des collaborateurs:', response); // Translated log
      // Transform the collaborators to include the selected property
      const collaboratorsWithSelection = (response.data || []).map((collaborator) => ({
        ...collaborator,
        selected: false
      }));
      setCollaborators(collaboratorsWithSelection);
    } catch (error) {
      console.error('Erreur lors du chargement des collaborateurs:', error); // Translated log
      setCollaborators([]);
      toast({
        title: "Erreur lors du chargement des collaborateurs", // Translated
        description: "Un problème est survenu lors du chargement de vos collaborateurs", // Translated
        variant: "destructive",
      });
    } finally {
      setIsLoadingCollaborators(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load data sequentially to better identify which call might be failing
        await loadTemplates();
        await loadAssignments();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error); // Translated log
        // Ensure we have empty arrays even if everything fails
        setTemplates([]);
        setAssignments([]);
        toast({
          title: "Erreur lors du chargement des données", // Translated
          description: "Un problème est survenu lors du chargement de vos modèles", // Translated
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredTemplates = templates.filter(template => 
    template.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter collaborators based on selected role and search term (keep comment)
  const filteredCollaborators = collaborators.filter(collaborator => {
    const matchesRole = roleFilter === 'all' || collaborator.role === roleFilter;
    const matchesSearch = 
      collaborator.email?.toLowerCase().includes(searchCollaboratorTerm.toLowerCase()) ||
      (collaborator.name && collaborator.name.toLowerCase().includes(searchCollaboratorTerm.toLowerCase()));
    
    return matchesRole && matchesSearch;
  });

  // Get unique roles for filter dropdown (keep comment)
  const uniqueRoles = Array.from(new Set(collaborators.map(c => c.role))).filter(Boolean);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des modèles...</p> {/* Translated */}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAssignForm = (template) => {
    setSelectedTemplate(template);
    setDueDate('');
    setSelectAll(false);
    setRoleFilter('all');
    setSearchCollaboratorTerm('');
    
    // Load collaborators when opening the assign dialog (keep comment)
    loadCollaborators();
    
    setAssignDialogOpen(true);
  };

  const handleValidatorAssignClick = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowValidatorAssignDialog(true);

    // Find the selected template to display its title in the dialog (keep comment)
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateForValidatorAssign(template);
    }

    // Load collaborators and filter them into validators and technicians (keep comment)
    setIsLoadingCollaborators(true);
    try {
      const response = await api.listCollaborators();
      const allCollaborators: Collaborator[] = response.data || [];
      setValidators(allCollaborators.filter(c => c.role === 'validator')); // Assuming role 'validator'
      setTechnicians(allCollaborators.filter(c => c.role === 'technician')); // Assuming role 'technician'
    } catch (error) {
      console.error('Erreur lors du chargement des collaborateurs pour l\'assignation de validateur:', error); // Translated log
      setValidators([]);
      setTechnicians([]);
      toast({
        title: "Erreur lors du chargement des utilisateurs", // Translated
        description: "Un problème est survenu lors du chargement des validateurs et techniciens", // Translated
        variant: "destructive",
      });
    } finally {
      setIsLoadingCollaborators(false);
    }
  };

  const handleSubmitValidatorAssignment = async () => {
    if (!selectedTemplateId || !selectedValidatorId || selectedTechnicianIds.length === 0) {
      toast({
        title: "Informations manquantes", // Translated
        description: "Veuillez sélectionner un modèle, un validateur et au moins un technicien.", // Translated
        variant: "destructive",
      });
      return;
    }

    setIsAssigningValidator(true);

    try {
      await api.assignValidatorToTechnicians({
        form_template_id: selectedTemplateId,
        validator_id: selectedValidatorId,
        technician_ids: selectedTechnicianIds,
      });

      toast({
        title: "Validateur assigné", // Translated
        description: "Le validateur a été assigné avec succès au(x) technicien(s) sélectionné(s).", // Translated
      });

      // Close dialog and reset state
      setShowValidatorAssignDialog(false);
      setSelectedTemplateId(null);
      setSelectedValidatorId(null);
      setSelectedTechnicianIds([]);
      setSelectedTemplateForValidatorAssign(null);

    } catch (error) {
      console.error('Erreur lors de l\'assignation du validateur:', error); // Translated log
      let errorMessage = "Un problème est survenu lors de l'assignation du validateur."; // Translated
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Échec de l'assignation", // Translated
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAssigningValidator(false);
    }
  };


  const handleCollaboratorSelectionChange = (collaboratorId, selected) => {
    const updatedCollaborators = collaborators.map(c =>
      c.id === collaboratorId ? { ...c, selected } : c
    );
    setCollaborators(updatedCollaborators);
    
    // Update selectAll state based on all visible collaborators being selected (keep comment)
    setSelectAll(filteredCollaborators.every(c => c.selected));
  };

  const handleSelectAllChange = (selected) => {
    setSelectAll(selected);
    
    // Update only the filtered collaborators (keep comment)
    const updatedCollaborators = collaborators.map(c => {
      if (filteredCollaborators.some(fc => fc.id === c.id)) {
        return { ...c, selected };
      }
      return c;
    });
    
    setCollaborators(updatedCollaborators);
  };

  const handleSubmitAssignment = async () => {
    const selectedCollaboratorsToAssign = collaborators.filter(c => c.selected);
    
    if (selectedCollaboratorsToAssign.length === 0) {
      toast({
        title: "Erreur", // Translated
        description: "Veuillez sélectionner au moins un collaborateur", // Translated
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "Erreur", // Translated
        description: "Aucun modèle sélectionné", // Translated
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    
    try {
      // Create an array of promises for each assignment (keep comment)
      const assignmentPromises = selectedCollaboratorsToAssign.map(collaborator => {
        const assignmentData = {
          form_template_id: selectedTemplate.id,
          assignee_email: collaborator.email,
          ...(dueDate && dueDate.trim() !== "" ? { due_date: dueDate } : {})
        };
        
        console.log('Envoi des données d\'assignation:', assignmentData); // Translated log
        return api.assignForm(assignmentData);
      });
      
      // Wait for all assignments to complete (keep comment)
      await Promise.all(assignmentPromises);
      
      // Refresh assignments list (keep comment)
      await loadAssignments();
      
      toast({
        title: "Formulaires assignés", // Translated
        description: `Formulaire assigné avec succès à ${selectedCollaboratorsToAssign.length} collaborateur(s)`, // Translated
      });
      
      setAssignDialogOpen(false);
      setDueDate('');
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Détails de l\'erreur API:', { // Translated log
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      console.error('Erreur lors de l\'assignation du formulaire:', error); // Translated log
      
      // Extract more detailed error information if available (keep comment)
      let errorMessage = "Un problème est survenu lors de l'assignation de ce formulaire"; // Translated
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast({
        title: "Erreur lors de l'assignation du formulaire", // Translated
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      await api.deleteFormTemplate(templateToDelete);
      await loadTemplates();
      toast({
        title: "Modèle supprimé", // Translated
        description: "Le modèle a été supprimé avec succès", // Translated
      });
      setShowDeleteConfirmDialog(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du modèle:', error); // Translated log
      let errorMessage = "Un problème est survenu lors de la suppression de ce modèle"; // Translated
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Erreur lors de la suppression du modèle", // Translated
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTemplate = (templateId: string) => { // Explicitly type templateId
    navigate(`/form-templates/${templateId}/edit`);
  };

  const handleViewTemplateDetails = (templateId: string) => { // Explicitly type templateId
    navigate(`/form-templates/${templateId}`);
  };

  const handleCreateTemplate = () => {
    navigate('/form-templates/new');
  };

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modèles de formulaires</h1> {/* Translated */}
            <p className="text-muted-foreground mt-1">
              Gérer et assigner les modèles de formulaires aux collaborateurs {/* Translated */}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button onClick={handleCreateTemplate}>
              <FilePlus className="h-4 w-4 mr-2" />
              Créer un nouveau modèle {/* Translated */}
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des modèles..." // Translated
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun modèle de formulaire trouvé</h3> {/* Translated */}
            <p className="text-muted-foreground mb-6">Commencez par créer votre premier modèle de formulaire.</p> {/* Translated */}
            <Button onClick={handleCreateTemplate}>
              Créer un nouveau modèle {/* Translated */}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => {
              // Count assignments for this template (keep comment)
              const assignmentCount = assignments.filter(
                a => a.formTemplateId === template.id
              ).length;
              
              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{template.title || 'Modèle sans titre'}</span> {/* Translated default */}
                      <div className="flex items-center space-x-2">
                        {template.origin && (
                          <Badge variant="secondary">
                            {template.origin === 'created' ? 'Créé' : 'Assigné'} {/* Translated */}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {/* Pluralization logic */}
                          {template.fields?.length || 0} champ{template.fields?.length !== 1 ? 's' : ''} {/* Translated field(s) */}
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Créé le {formatDate(template.created_at)} {/* Translated */}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                         
                      </div>
                      <p className="text-sm line-clamp-2">
                        {template.description || 'Aucune description fournie'} {/* Translated */}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      {isAdmin && ( // Only show edit/delete for admins
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(template.id)}
                            disabled={isDeleting}
                            title="Supprimer le modèle" // Translated tooltip
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleViewTemplateDetails(template.id)}
                      >
                        Voir les détails {/* Translated */}
                      </Button>
                      <Button onClick={() => handleAssignForm(template)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assigner {/* Translated */}
                      </Button>
                       <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleValidatorAssignClick(template.id)}
                        title="Assigner des validateurs aux soumissions des techniciens" // Translated tooltip
                      >
                        {/* Placeholder icon, replace with a more suitable one (keep comment) */}
                        <ClipboardList className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assigner le modèle de formulaire aux collaborateurs</DialogTitle> {/* Translated */}
            <DialogDescription>
              Sélectionnez les collaborateurs auxquels assigner ce modèle. {/* Translated */}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="py-4">
              <h4 className="font-medium">{selectedTemplate.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTemplate.description || 'Aucune description fournie'} {/* Translated */}
              </p>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Collaborateurs</Label> {/* Translated */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-2">
                          {collaborators.filter(c => c.selected).length} sélectionné(s) {/* Translated */}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isLoadingCollaborators ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="flex space-x-4 mb-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Rechercher des collaborateurs..." // Translated
                              className="pl-9"
                              value={searchCollaboratorTerm}
                              onChange={(e) => setSearchCollaboratorTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="w-48">
                          <Select
                            value={roleFilter}
                            onValueChange={setRoleFilter}
                          >
                            <SelectTrigger>
                              <div className="flex items-center">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filtrer par rôle" /> {/* Translated */}
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les rôles</SelectItem> {/* Translated */}
                              {uniqueRoles.map(role => (
                                <SelectItem key={role} value={role}>
                                  {/* Role names are likely technical, keep as is */}
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <div className="flex items-center">
                                  <Checkbox 
                                    id="select-all"
                                    checked={selectAll}
                                    onCheckedChange={(checked) => 
                                      handleSelectAllChange(checked === true)
                                    }
                                  />
                                </div>
                              </TableHead>
                              <TableHead>Nom</TableHead> {/* Translated */}
                              <TableHead>E-mail</TableHead> {/* Translated */}
                              <TableHead>Rôle</TableHead> {/* Translated */}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCollaborators.length > 0 ? (
                              filteredCollaborators.map((collaborator) => (
                                <TableRow key={collaborator.id}>
                                  <TableCell>
                                    <Checkbox 
                                      checked={collaborator.selected}
                                      onCheckedChange={(checked) => 
                                        handleCollaboratorSelectionChange(collaborator.id, checked === true)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>{collaborator.name || '—'}</TableCell>
                                  <TableCell>{collaborator.email}</TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">
                                      {/* Role names are likely technical, keep as is */}
                                      {collaborator.role}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                  Aucun collaborateur trouvé correspondant à vos critères {/* Translated */}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date d'échéance (optionnel - s'applique à tous)</Label> {/* Translated */}
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Annuler {/* Translated */}
            </Button>
            <Button 
              onClick={handleSubmitAssignment} 
              disabled={isAssigning || collaborators.filter(c => c.selected).length === 0}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assignation en cours... {/* Translated */}
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Assigner aux sélectionnés ({collaborators.filter(c => c.selected).length}) {/* Translated */}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Dialog for Validator Assignment */}
      <Dialog open={showValidatorAssignDialog} onOpenChange={setShowValidatorAssignDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assigner des validateurs aux soumissions des techniciens</DialogTitle> {/* Translated */}
            <DialogDescription>
              Sélectionnez les validateurs et les techniciens pour ce modèle de formulaire. {/* Translated */}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplateForValidatorAssign && (
            <div className="py-4">
              <h4 className="font-medium">{selectedTemplateForValidatorAssign.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTemplateForValidatorAssign.description || 'Aucune description fournie'} {/* Translated */}
              </p>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Validators List */}
                <div>
                  <Label>Sélectionner un validateur</Label> {/* Translated */}
                  {isLoadingCollaborators ? (
                     <div className="flex justify-center items-center py-4">
                       <Loader2 className="h-5 w-5 animate-spin text-primary" />
                     </div>
                   ) : validators.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">Aucun validateur trouvé.</p> 
                  ) : (
                    <div className="space-y-2 mt-2">
                      {validators.map(validator => (
                        <div key={validator.id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`validator-${validator.id}`}
                            name="validator"
                            value={validator.id}
                            checked={selectedValidatorId === validator.id}
                            onChange={() => setSelectedValidatorId(validator.id)}
                            className="form-radio"
                          />
                          <Label htmlFor={`validator-${validator.id}`}>
                            {validator.name || validator.email}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

               
                <div>
                  <Label>Sélectionner des techniciens</Label> 
                   {isLoadingCollaborators ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : technicians.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">Aucun technicien trouvé.</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {technicians.map(technician => (
                        <div key={technician.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`technician-${technician.id}`}
                            checked={selectedTechnicianIds.includes(technician.id)}
                            onCheckedChange={(checked) => {
                              setSelectedTechnicianIds(prev =>
                                checked ? [...prev, technician.id] : prev.filter(id => id !== technician.id)
                              );
                            }}
                          />
                          <Label htmlFor={`technician-${technician.id}`}>
                            {technician.name || technician.email}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidatorAssignDialog(false)}>
              Annuler {/* Translated */}
            </Button>
             <Button
              onClick={handleSubmitValidatorAssignment}
              disabled={isAssigningValidator || !selectedValidatorId || selectedTechnicianIds.length === 0}
            >
               {isAssigningValidator ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assignation en cours... 
                </>
              ) : (
                'Assigner le validateur' 
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle> {/* Translated */}
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce modèle de formulaire ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirmDialog(false);
                setTemplateToDelete(null);
              }}
              disabled={isDeleting}
            >
              Annuler {/* Translated */}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTemplate}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Suppression... {/* Translated */}
                </>
              ) : (
                'Supprimer' /* Translated */
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default FormTemplates;
