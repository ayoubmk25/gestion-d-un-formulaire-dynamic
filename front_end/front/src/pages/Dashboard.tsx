import React, { useEffect, useState } from 'react';
import Chatbot from '@/components/Chatbot'; // Import the Chatbot component
import { useAuth } from '@/contexts/AuthContext';
import { useFormContext } from '@/contexts/FormContext';
import { useApi } from '@/hooks/useApi';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle,
  CheckCircle,
  File,
  FileCheck,
  FileEdit,
  Layers,
  Users,
  Calendar,
  ArrowRight,
  Building,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const statsColors = {
  primary: 'bg-primary text-primary-foreground',
  blue: 'bg-blue-500 text-white',
  amber: 'bg-amber-500 text-white',
  rose: 'bg-rose-500 text-white',
};

// Define types for the API responses
interface AdminDashboardStats {
  total_collaborators: number;
  active_collaborators: number;
  total_forms: number;
  available_forms: number;
  forms_to_create: number;
  total_submissions: number;
  submissions_by_status: {
    draft: number;
    submitted: number;
    validated: number;
  };
}

interface CollaboratorDashboardStats {
  assigned_forms: number;
  completed_forms: number;
  submissions_by_status: {
    draft: number;
    submitted: number;
    validated: number;
  };
}

interface Company {
  id: string;
  name: string;
  active: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { submissions, templates, assignments, loadTemplates, loadSubmissions, loadAssignments } = useFormContext();
  const { t } = useTranslation(); // Use the hook
  const [isLoading, setIsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminDashboardStats | null>(null);
  const [collaboratorStats, setCollaboratorStats] = useState<CollaboratorDashboardStats | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const api = useApi();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Charger les données communes // Translated comment
        await Promise.all([
          loadTemplates(),
          loadSubmissions(),
          loadAssignments()
        ]);

        // Récupérer les statistiques du tableau de bord spécifiques au rôle // Translated comment
        if (user.role === 'root') {
          const companiesRes = await api.listCompanies();
          setCompanies(companiesRes.data || []);
        } 
        else if (user.role === 'administrator') {
          const statsRes = await api.getAdminDashboardStats();
          setAdminStats(statsRes.data);
        } 
        else if (user.role === 'technician' || user.role === 'validator') {
          const statsRes = await api.getCollaboratorDashboardStats();
          setCollaboratorStats(statsRes.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error); // Translated error message
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Chargement du tableau de bord...</p> {/* Translated */}
          </div>
        </div>
      </Layout>
    );
  }

  // Root-specific dashboard
  const renderRootDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Sociétés</CardTitle> {/* Translated */}
            <CardDescription>Organisations enregistrées</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Building className="h-8 w-8 text-primary mr-3" />
              <div className="text-3xl font-bold">{companies.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Modèles de formulaires</CardTitle> {/* Translated */}
            <CardDescription>Modèles disponibles</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <File className="h-8 w-8 text-blue-500 mr-3" />
              <div className="text-3xl font-bold">{templates.length}</div>
            </div>
          </CardContent>
        </Card>


      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sociétés</CardTitle> {/* Translated */}
            <CardDescription>Organisations enregistrées</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.length > 0 ? (
                companies.map((company: Company, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-12 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {company.active ? 'Actif' : 'Inactif'} {/* Translated */}
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/companies/${company.id}`}>
                        Voir <ArrowRight className="ml-2 h-4 w-4" /> {/* Translated */}
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune société enregistrée pour le moment {/* Translated */}
                </div>
              )}
            </div>
          </CardContent>
        </Card>


      </div>
    </>
  );

  // Admin-specific dashboard
  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Collaborateurs</CardTitle> {/* Translated */}
            <CardDescription>Membres de l'équipe</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary mr-3" />
              <div className="text-3xl font-bold">{adminStats?.total_collaborators || 0}</div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {adminStats?.active_collaborators || 0} membres actifs {/* Translated */}
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Modèles de formulaires</CardTitle> {/* Translated */}
            <CardDescription>Modèles disponibles</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <File className="h-8 w-8 text-blue-500 mr-3" />
              <div className="text-3xl font-bold">{adminStats?.available_forms || 0}</div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {adminStats?.forms_to_create || 0} formulaires à créer {/* Translated */}
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Soumissions</CardTitle> {/* Translated */}
            <CardDescription>Soumissions de formulaires</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-green-500 mr-3" />
              <div className="text-3xl font-bold">{adminStats?.total_submissions || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statut des soumissions</CardTitle> {/* Translated */}
            <CardDescription>Statuts des soumissions de formulaires</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-purple-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Brouillon</p> {/* Translated */}
                    <p className="text-sm text-muted-foreground">Soumissions incomplètes</p> {/* Translated */}
                  </div>
                </div>
                <div className="text-2xl font-bold">{adminStats?.submissions_by_status?.draft || 0}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-amber-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Soumis</p> {/* Translated */}
                    <p className="text-sm text-muted-foreground">En attente de validation</p> {/* Translated */}
                  </div>
                </div>
                <div className="text-2xl font-bold">{adminStats?.submissions_by_status?.submitted || 0}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Validé</p> {/* Translated */}
                    <p className="text-sm text-muted-foreground">Soumissions approuvées</p> {/* Translated */}
                  </div>
                </div>
                <div className="text-2xl font-bold">{adminStats?.submissions_by_status?.validated || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Gestion des formulaires</CardTitle> {/* Translated */}
            <CardDescription>Statistiques des modèles et affectations</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="h-6 w-6 text-blue-500 mr-3" />
                  <span>Modèles disponibles</span> {/* Translated */}
                </div>
                <span className="font-bold">{adminStats?.available_forms || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileEdit className="h-6 w-6 text-amber-500 mr-3" />
                  <span>Formulaires à créer</span> {/* Translated */}
                </div>
                <span className="font-bold">{adminStats?.forms_to_create || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-green-500 mr-3" />
                  <span>Collaborateurs actifs</span> {/* Translated */}
                </div>
                <span className="font-bold">{adminStats?.active_collaborators || 0}</span>
              </div>

              <div className="mt-6 flex space-x-4"> {/* Added flex and space-x-4 for button spacing */}
                <Button asChild>
                  <Link to="/form-templates/new">
                    Créer un nouveau modèle {/* Translated */}
                  </Link>
                </Button>
                <Button asChild variant="outline"> 
                  <Link to="/profile">
                    Voir le profil {/* Translated */}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  // Collaborator/Validator-specific dashboard
  const renderCollaboratorDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Formulaires Assignés</CardTitle> {/* Translated */}
            <CardDescription>Formulaires qui vous sont assignés</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <File className="h-8 w-8 text-primary mr-3" />
              <div className="text-3xl font-bold">{collaboratorStats?.assigned_forms || 0}</div>
            </div>
            <div className="mt-4">
              <Button asChild size="sm" variant="outline">
                <Link to="/forms">
                  {t('dashboard.viewAll')} <ArrowRight className="ml-2 h-4 w-4" /> {/* Keep t() */}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            {/* Keep t() */}
            <CardTitle className="text-lg font-medium">{t('dashboard.completedForms.title')}</CardTitle>
            <CardDescription>{t('dashboard.completedForms.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-green-500 mr-3" />
              <div className="text-3xl font-bold">{collaboratorStats?.completed_forms || 0}</div>
            </div>
            <div className="mt-4">
              <Button asChild size="sm" variant="outline">
                <Link to="/submissions">
                  {t('dashboard.viewAll')} <ArrowRight className="ml-2 h-4 w-4" /> {/* Keep t() */}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
             {/* Keep t() */}
            <CardTitle className="text-lg font-medium">{t('dashboard.pending.title')}</CardTitle>
            <CardDescription>{t('dashboard.pending.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-amber-500 mr-3" />
              <div className="text-3xl font-bold">
                {(collaboratorStats?.submissions_by_status?.draft || 0) + 
                 (collaboratorStats?.submissions_by_status?.submitted || 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
             {/* Keep t() */}
            <CardTitle>{t('dashboard.submissionStatus.title')}</CardTitle>
            <CardDescription>{t('dashboard.submissionStatus.description.collaborator')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-purple-500 rounded-full mr-3"></div>
                  <div>
                     {/* Keep t() */}
                    <p className="font-medium">{t('dashboard.submissionStatus.draft.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.submissionStatus.draft.description')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">{collaboratorStats?.submissions_by_status?.draft || 0}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-amber-500 rounded-full mr-3"></div>
                  <div>
                     {/* Keep t() */}
                    <p className="font-medium">{t('dashboard.submissionStatus.submitted.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.submissionStatus.submitted.description')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">{collaboratorStats?.submissions_by_status?.submitted || 0}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-green-500 rounded-full mr-3"></div>
                  <div>
                     {/* Keep t() */}
                    <p className="font-medium">{t('dashboard.submissionStatus.validated.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.submissionStatus.validated.description')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">{collaboratorStats?.submissions_by_status?.validated || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
       
      </div>
    </>
  );

  return (
    <Layout>
      <div className="container py-8">
        {/* Keep t() */}
        <h1 className="text-3xl font-bold mb-8">{t('dashboard.title')}</h1>
        
        {user.role === 'root' && renderRootDashboard()}
        {user.role === 'administrator' && renderAdminDashboard()}
        {(user.role === 'technician' || user.role === 'validator') && renderCollaboratorDashboard()}

        {/* Add the Chatbot component */}
        <div className="mt-8">
          <Chatbot />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
