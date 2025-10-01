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
  MoreHorizontal, 
  UserPlus, 
  Search, 
  UserCog, 
  Users,
  Edit,
  Trash2,
  UserCheck // Import UserCheck icon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

const Collaborators = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [collaborators, setCollaborators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false); // Corrected variable name
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  
  // Get API methods from the hook
  const { listCollaborators, deactivateCollaborator, activateCollaborator, deleteCollaborator } = useApi();

  // Function to load collaborators from the API
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listCollaborators();
      setCollaborators(response.data || []);
    } catch (error) {
      console.error('Error loading collaborators:', error);
      toast({
        title: "Error loading collaborators",
        description: "There was a problem loading the collaborators list.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [listCollaborators]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCollaborators = collaborators.filter(collaborator => {
    const name = collaborator?.name || '';
    const email = collaborator?.email || '';
    const role = collaborator?.role || '';
    const isActive = collaborator?.is_active;

    const matchesSearch = (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDeactivateCollaborator = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setDeactivateDialogOpen(true); // Corrected variable name
  };

  const confirmDeactivate = async () => { // Corrected function name
    if (!selectedCollaborator) return;

    try {
      await deactivateCollaborator(selectedCollaborator.id);
      
      // Update local state
      setCollaborators(prevCollaborators =>
        prevCollaborators.map(c =>
          c.id === selectedCollaborator.id
            ? { ...c, is_active: false } // Assuming is_active is the correct field
            : c
        )
      );

      toast({
        title: "Collaborator deactivated",
        description: `${selectedCollaborator.name} has been deactivated`,
        variant: "default",
      });
      // Force a page reload to unblock and show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error deactivating collaborator:', error);
      toast({
        title: "Error deactivating collaborator",
        description: "There was a problem deactivating this collaborator.",
        variant: "destructive",
      });
    } finally {
      setDeactivateDialogOpen(false); // Corrected variable name
      setSelectedCollaborator(null);
    }
  };

  const handleActivateCollaborator = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setActivateDialogOpen(true);
  };

  const confirmActivate = async () => {
    if (!selectedCollaborator) return;

    try {
      await activateCollaborator(selectedCollaborator.id);
      
      // Update local state
      setCollaborators(prevCollaborators =>
        prevCollaborators.map(c =>
          c.id === selectedCollaborator.id
            ? { ...c, is_active: true } // Assuming is_active is the correct field
            : c
        )
      );

      toast({
        title: "Collaborator activated",
        description: `${selectedCollaborator.name} has been activated`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error activating collaborator:', error);
      toast({
        title: "Error activating collaborator",
        description: "There was a problem activating this collaborator.",
        variant: "destructive",
      });
    } finally {
      setActivateDialogOpen(false);
      setSelectedCollaborator(null);
    }
  };

  const handleDeleteCollaborator = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCollaborator) return;

    try {
      await deleteCollaborator(selectedCollaborator.id);
      
      // Update local state
      setCollaborators(prevCollaborators =>
        prevCollaborators.filter(c => c.id !== selectedCollaborator.id)
      );

      toast({
        title: "Collaborator deleted",
        description: `${selectedCollaborator.name} has been deleted`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting collaborator:', error);
      toast({
        title: "Error deleting collaborator",
        description: "There was a problem deleting this collaborator.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCollaborator(null);
    }
  };

 if (isLoading) {
    return (
      <Layout>
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
            <h1 className="text-3xl font-bold tracking-tight">Collaborateurs</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les collaborateurs de votre entreprise
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button onClick={() => navigate('/collaborators/new')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un collaborateur
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tous les collaborateurs</CardTitle>
                <CardDescription>
                  Gérez les techniciens et les validateurs de votre entreprise
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des collaborateurs..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCollaborators.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun collaborateur trouvé</h3>
                <p className="text-muted-foreground mb-6">Ajoutez votre premier collaborateur pour commencer.</p>
                <Button onClick={() => navigate('/collaborators/new')}>
                  Ajouter un collaborateur
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">Nom</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Rôle</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Statut</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Ajouté le</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredCollaborators.map((collaborator) => (
                        <tr 
                          key={collaborator.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">{collaborator.name}</td>
                          <td className="p-4 align-middle">{collaborator.email}</td>
                          <td className="p-4 align-middle">
                            <Badge variant="outline" className="capitalize">
                              {collaborator.role}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            {collaborator.is_active == true ? (
                              <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50">
                                Actif
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                Inactif
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            {new Date(collaborator.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 align-middle text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate(`/collaborators/${collaborator.id}`)}>
                                  <UserCog className="h-4 w-4 mr-2" />
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/collaborators/${collaborator.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeactivateCollaborator(collaborator)}
                                  className="text-destructive focus:text-destructive"
                                  disabled={!collaborator.is_active}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Désactiver
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleActivateCollaborator(collaborator)}
                                  disabled={collaborator.is_active}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteCollaborator(collaborator)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
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

      {/* AlertDialogs */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cela va désactiver le compte du collaborateur. Il ne pourra plus se connecter ni accéder au système.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate}>Désactiver</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cela va activer le compte du collaborateur. Il pourra à nouveau accéder au système.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmActivate}>Activer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cela supprimera définitivement le compte du collaborateur ainsi que toutes les données associées. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Collaborators;
