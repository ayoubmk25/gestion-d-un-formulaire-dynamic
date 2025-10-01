import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal, 
  PlusCircle, 
  Search, 
  Users, 
  FileText,
  Edit, 
  XCircle, 
  Eye,
  Trash2 // Import Trash2 icon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

const Companies = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  
  // Get API methods from the hook
  const { listCompanies, deactivateCompany, activateCompany, deleteCompany } = useApi();

  useEffect(() => {
    // Function to load companies from the API
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await listCompanies();
        setCompanies(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error loading companies:', error);
        toast({
          title: "Erreur lors du chargement des sociétés", // Translated
          description: "Un problème est survenu lors du chargement de la liste des sociétés.", // Translated
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [listCompanies]); // Add listCompanies to dependency array


  const filteredCompanies = companies.filter(company => {
    const name = company?.name || '';
    const email = company?.email || '';
    const isActive = company?.is_active;

    const matchesSearch = (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus === 'all') {
      return matchesSearch;
    } else if (filterStatus === 'active') {
      return matchesSearch && isActive;
    } else if (filterStatus === 'inactive') {
      return matchesSearch && !isActive;
    }

    return matchesSearch; // Should not reach here if filterStatus is one of the defined values
  });

  const handleDeactivateCompany = (company) => {
    setSelectedCompany(company);
    setDeactivateDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedCompany) return;

    try {
      await deactivateCompany(selectedCompany.id);
      
      // Update local state
      setCompanies(prevCompanies =>
        prevCompanies.map(c =>
          c.id === selectedCompany.id
            ? { ...c, status: 'inactive', is_active: false }
            : c
        )
      );

      toast({
        title: "Société désactivée", // Translated
        description: `${selectedCompany.name || 'La société'} a été désactivée`, // Translated (with variable)
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
      setSelectedCompany(null);
    }
  };

  const handleActivateCompany = (company) => {
    setSelectedCompany(company);
    setActivateDialogOpen(true);
  };

  const confirmActivate = async () => {
    if (!selectedCompany) return;

    try {
      await activateCompany(selectedCompany.id);
      
      // Update local state
      setCompanies(prevCompanies =>
        prevCompanies.map(c =>
          c.id === selectedCompany.id
            ? { ...c, status: 'active', is_active: true }
            : c
        )
      );

      toast({
        title: "Société activée", // Translated
        description: `${selectedCompany.name || 'La société'} a été activée`, // Translated (with variable)
        variant: "default",
      });
    } catch (error) {
      console.error('Error activating company:', error);
      toast({
        title: "Erreur lors de l'activation de la société", // Translated
        description: "Un problème est survenu lors de l'activation de cette société.", // Translated
        variant: "destructive",
      });
    } finally {
      setActivateDialogOpen(false);
      setSelectedCompany(null);
    }
  };

  const handleDeleteCompany = (company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCompany) return;

    try {
      await deleteCompany(selectedCompany.id);
      
      // Update local state
      setCompanies(prevCompanies =>
        prevCompanies.filter(c => c.id !== selectedCompany.id)
      );

      toast({
        title: "Société supprimée", // Translated
        description: `${selectedCompany.name || 'La société'} a été supprimée`, // Translated (with variable)
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Erreur lors de la suppression de la société", // Translated
        description: "Un problème est survenu lors de la suppression de cette société.", // Translated
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCompany(null);
    }
  };

  // Function to load companies from the API (already defined and used in useEffect)
  // const loadData = async () => { ... } 

  if (isLoading) {
    return (
      <Layout>
        {/* Skeleton Loader - No text to translate here */}
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="flex justify-between">
              <div className="h-10 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded w-1/4"></div>
            </div>
            <div className="h-[500px] bg-muted rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sociétés</h1> {/* Translated */}
            <p className="text-muted-foreground mt-1">
              Gérer les sociétés utilisant la plateforme FormFlow {/* Translated */}
            </p>
            <p></p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button onClick={() => navigate('/companies/new')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter une société {/* Translated */}
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Toutes les sociétés</CardTitle> {/* Translated */}
                <CardDescription>
                  Gérer les sociétés et leurs ressources {/* Translated */}
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des sociétés..." // Translated
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" /> {/* Translated */}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem> {/* Translated */}
                    <SelectItem value="active">Actif</SelectItem> {/* Translated */}
                    <SelectItem value="inactive">Inactif</SelectItem> {/* Translated */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <BuildingIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune société trouvée</h3> {/* Translated */}
                <p className="text-muted-foreground mb-6">Ajoutez votre première société pour commencer.</p> {/* Translated */}
                <Button onClick={() => navigate('/companies/new')}>
                  Ajouter une société {/* Translated */}
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">Nom de la société</th> {/* Translated */}
                        <th className="h-12 px-4 text-left align-middle font-medium">E-mail</th> {/* Translated */}
                        <th className="h-12 px-4 text-left align-middle font-medium">Utilisateurs</th> {/* Translated */}
                        <th className="h-12 px-4 text-left align-middle font-medium">Formulaires disponibles</th> {/* Translated */}
                        <th className="h-12 px-4 text-left align-middle font-medium">Formulaires à créer</th> {/* Translated */}
                        <th className="h-12 px-4 text-left align-middle font-medium">Statut</th> {/* Translated */}
                        <th className="h-12 px-4 text-left align-middle font-medium">date de fin d'abonnement</th> {/* Kept original French */}
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th> {/* Translated */}
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredCompanies.map((company) => (
                        <tr 
                          key={company.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle font-medium">{company.name || 'N/A'}</td>
                          <td className="p-4 align-middle">{company.email || 'N/A'}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                              {company.max_users ?? 0}
                            </div>
                          </td>
                          <td className="p-4 align-middle"> {/* Display Available Forms */}
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                              {company.abonnements?.[0]?.available_forms ?? 0}
                            </div>
                          </td>
                          <td className="p-4 align-middle"> {/* Display Forms to Create */}
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                              {company.abonnements?.[0]?.forms_to_create ?? 0}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            {company.is_active ? (
                              <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50">
                                Actif {/* Translated */}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                Inactif {/* Translated */}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            {company.created_at 
                              ? new Date(company.abonnements?.[0]?.date_fin ?? 0).toLocaleDateString() 
                              : 'N/A'}
                          </td>
                          <td className="p-4 align-middle text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel> {/* Translated */}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate(`/companies/${company.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir les détails {/* Translated */}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/companies/${company.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier {/* Translated */}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeactivateCompany(company)}
                                  className="text-destructive focus:text-destructive"
                                  disabled={!company.is_active}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Désactiver {/* Translated */}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleActivateCompany(company)}
                                  disabled={company.is_active}
                                >
                                  <BuildingIcon className="h-4 w-4 mr-2" /> {/* Using BuildingIcon for Activate */}
                                  Activer {/* Translated */}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteCompany(company)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> {/* Using Trash2 for Delete */}
                                  Supprimer {/* Translated */}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Deactivate Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle> {/* Translated */}
            <AlertDialogDescription>
              Ceci désactivera {selectedCompany?.name || 'cette société'}. Tous les utilisateurs de cette société perdront l'accès au système. {/* Translated (with variable) */}
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

      {/* Activate Dialog */}
      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle> {/* Translated */}
            <AlertDialogDescription>
              Ceci activera {selectedCompany?.name || 'cette société'}. Les utilisateurs de cette société retrouveront l'accès au système. {/* Translated (with variable) */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel> {/* Translated */}
            <AlertDialogAction onClick={confirmActivate}>
              Activer {/* Translated */}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle> {/* Translated */}
            <AlertDialogDescription>
              Ceci supprimera définitivement {selectedCompany?.name || 'cette société'} et toutes les données associées. Cette action est irréversible. {/* Translated (with variable) */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel> {/* Translated */}
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer {/* Translated */}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Companies;