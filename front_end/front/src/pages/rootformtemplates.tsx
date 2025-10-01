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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ClipboardList,
  FilePlus,
  Search,
  Trash2,
  Edit,
  Loader2,
  Eye, // Add Eye icon import
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Define types for better type safety (keep types in English)
interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  fields: any[];
  created_at: string;
}

const RootFormTemplates = () => {
  const navigate = useNavigate();
  const api = useApi();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyEmail, setSelectedCompanyEmail] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  // const [companyEmail, setCompanyEmail] = useState(''); // This seems unused if selectedCompanyEmail is used
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);


  // Helper function to safely format dates (keep comment in English)
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue'; // Translated

    try {
      // Try to parse the date string
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Date invalide'; // Translated
      }

      return format(date, 'PP');
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error); // Translated error message
      return 'Date invalide'; // Translated
    }
  };

  const loadTemplates = async () => {
    try {
      // Use the rootgetFormTemplate API call (keep comment)
      const response = await api.rootgetFormTemplate({}); // Pass an empty object for data
      console.log('Réponse API des modèles racines:', response); // Translated log
      // Check if response.data exists, otherwise use an empty array (keep comment)
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des modèles racines:', error); // Translated log
      // Set templates to empty array on error (keep comment)
      setTemplates([]);
      toast({
        title: "Erreur lors du chargement des modèles racines", // Translated
        description: "Un problème est survenu lors du chargement des modèles racines", // Translated
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await loadTemplates();
        const companiesResponse = await api.listCompanies();
        setCompanies(companiesResponse.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error); // Translated log
        // Ensure we have empty arrays even if everything fails (keep comment)
        setTemplates([]);
        setCompanies([]);
        toast({
          title: "Erreur lors du chargement des données", // Translated
          description: "Un problème est survenu lors du chargement des modèles racines ou des sociétés", // Translated
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredTemplates = templates.filter((template: FormTemplate) =>
    template.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des modèles racines...</p> {/* Translated */}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible.")) { // Translated confirm
      setIsDeleting(true);
      try {
        // Use the rootDeleteFormTemplate function from the useApi hook
        await api.rootDeleteFormTemplate(templateId);
        // Reload templates after successful deletion (keep comment)
        await loadTemplates();
        toast({
          title: "Modèle supprimé", // Translated
          description: "Le modèle a été supprimé avec succès", // Translated
        });
      } catch (error) {
        console.error('Erreur lors de la suppression du modèle:', error); // Translated log
        // Provide more specific error feedback if available (keep comment)
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
    }
  };

  const handleEditTemplate = (templateId: string) => {
    // Assuming root uses a similar edit page structure (keep comment)
    navigate(`/root/form-templates/${templateId}/edit`);
  };

  const handleViewTemplateDetails = (templateId: string) => {
    // Assuming root uses a similar details page structure (keep comment)
    navigate(`/root/form-templates/${templateId}`);
  };

  const handleCreateTemplate = () => {
    // Navigate to the root create template page (keep comment)
    navigate('/root/form-templates/new');
  };

  const handleAssignClick = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowAssignDialog(true);
  };

  const handleAssignForm = async () => {
    if (!selectedTemplateId || !selectedCompanyEmail) {
      toast({
        title: "Informations manquantes", // Translated
        description: "Veuillez sélectionner un modèle et une société.", // Translated
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      await api.rootAssignFormTemplateToCompany({
        form_template_id: selectedTemplateId,
        company_email: selectedCompanyEmail,
      });

      toast({
        title: "Formulaire assigné", // Translated
        description: "Le modèle de formulaire a été assigné avec succès à la société.", // Translated
      });

      // Optionally reload templates to reflect changes in available forms count for companies (keep comment)
      // await loadTemplates();

    } catch (error) {
      console.error('Erreur lors de l\'assignation du formulaire:', error); // Translated log
      let errorMessage = "Un problème est survenu lors de l'assignation du modèle de formulaire."; // Translated
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
      setIsAssigning(false);
      setShowAssignDialog(false);
      setSelectedCompanyEmail('');
      setSelectedTemplateId(null);
    }
  };


  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modèles de formulaires racines</h1> {/* Translated */}
            <p className="text-muted-foreground mt-1">
              Gérer les modèles de formulaires racines {/* Translated */}
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Button onClick={handleCreateTemplate}>
              <FilePlus className="h-4 w-4 mr-2" />
              Créer un nouveau modèle racine {/* Translated */}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des modèles racines..." // Translated
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun modèle de formulaire racine trouvé</h3> {/* Translated */}
            <p className="text-muted-foreground mb-6">Commencez par créer votre premier modèle de formulaire racine.</p> {/* Translated */}
            <Button onClick={handleCreateTemplate}>
              Créer un nouveau modèle racine {/* Translated */}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: FormTemplate) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{template.title || 'Modèle sans titre'}</span> {/* Translated default */}
                    <Badge variant="outline">
                      {/* Pluralization */}
                      {template.fields?.length || 0} champ{template.fields?.length !== 1 ? 's' : ''} {/* Translated field(s) */}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Créé le {formatDate(template.created_at)} {/* Translated */}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2">
                    {template.description || 'Aucune description fournie'} {/* Translated */}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  {/* View Details Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewTemplateDetails(template.id)}
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteTemplate(template.id)}
                    disabled={isDeleting}
                    title="Supprimer le modèle" // Translated
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                   
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAssignClick(template.id)}
                    title="Assigner le modèle à une société" // Translated
                  >
                    <FilePlus className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assigner le modèle de formulaire</DialogTitle> {/* Translated */}
            <DialogDescription>
              Saisissez l'e-mail de la société pour assigner ce modèle de formulaire. {/* Translated */}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companySelect" className="text-right">
                Sélectionner une société {/* Translated */}
              </Label>
              <select
                id="companySelect"
                value={selectedCompanyEmail}
                onChange={(e) => setSelectedCompanyEmail(e.target.value)}
                className="col-span-3 border rounded-md p-2"
              >
                <option value="">-- Sélectionner une société --</option> {/* Translated */}
                {companies.map((company: any) => (
                  <option key={company.id} value={company.email}>
                    {company.name} ({company.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssignForm} disabled={isAssigning || !selectedCompanyEmail}>
              {isAssigning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FilePlus className="h-4 w-4 mr-2" />
              )}
              Assigner {/* Translated */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default RootFormTemplates;
