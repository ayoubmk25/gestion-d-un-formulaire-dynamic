import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';

import { AuthProvider } from '@/contexts/AuthContext';
import { FormProvider } from '@/contexts/FormContext';
import { UserRole } from '@/contexts/AuthContext';

import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import { Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Forms from './pages/Forms';
import FormDetails from './pages/FormDetails';
import FormTemplates from './pages/FormTemplates';
import CreateFormTemplate from './pages/CreateFormTemplate';
import Collaborators from './pages/Collaborators';
import CreateCollaborator from './pages/CreateCollaborator';
import Companies from './pages/Companies';
import CreateCompany from './pages/CreateCompany';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import CompanyDetails from "./pages/CompanyDetails";
import EditCompany from "./pages/EditCompany";
import EditCollaborator from "./pages/EditCollaborator";
import CollaboratorDetails from "./pages/CollaboratorDetails";
import FormTemplateDetails from "./pages/FormTemplateDetails";
import FormSubmission from "./pages/FormSubmission";
import ValidatorSubmissionDetails from "./pages/ValidatorSubmissionDetails";
import RootFormTemplates from "./pages/rootformtemplates";
import RootCreateFormTemplate from "./pages/rootcreateformtemplates";
import RootFormTemplateDetails from "./pages/RootFormTemplateDetails";
import RootEditFormTemplate from "./pages/RootEditFormTemplate"; // Import the new edit component
import FormAssignments from "./pages/FormAssignments";
import Discussion from "./pages/Discussion"; // Import the Discussion component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nextProvider i18n={i18n}> {/* Wrap with I18nextProvider */}
        <BrowserRouter>
          <AuthProvider> {/* Move AuthProvider inside BrowserRouter */}
            <FormProvider> {/* Keep FormProvider inside AuthProvider if it depends on auth context */}
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              {/* Technician & Validator routes */}
              <Route
                path="/forms"
                element={
                  <PrivateRoute allowedRoles={['technician', 'validator'] as UserRole[]}>
                    <Forms />
                  </PrivateRoute>
                }
              />
              {/* Add the new route for root template details */}
              <Route
                path="/root/form-templates/:id"
                element={
                  <PrivateRoute allowedRoles={['root'] as UserRole[]}>
                    <RootFormTemplateDetails />
                  </PrivateRoute>
                }
              />
              {/* Add the new route for root edit template */}
              <Route
                path="/root/form-templates/:id/edit"
                element={
                  <PrivateRoute allowedRoles={['root'] as UserRole[]}>
                    <RootEditFormTemplate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/forms/:id"
                element={
                  <PrivateRoute allowedRoles={['technician', 'validator'] as UserRole[]}>
                    <FormDetails />
                  </PrivateRoute>
                }
              />
             
              <Route
                path="/form-submission/:mode/:id"
                element={
                  <PrivateRoute allowedRoles={['technician', 'validator'] as UserRole[]}>
                    <FormSubmission />
                  </PrivateRoute>
                }
              />

              {/* Validator routes */}
              <Route
                path="/validator/submissions/:id"
                element={
                  <PrivateRoute allowedRoles={['validator'] as UserRole[]}>
                    <ValidatorSubmissionDetails />
                  </PrivateRoute>
                }
              />

              {/* Administrator routes */}
              <Route
                path="/admin/form-assignments"
                element={
                  <PrivateRoute allowedRoles={['administrator'] as UserRole[]}>
                    <FormAssignments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/form-templates"
                element={
                  <PrivateRoute allowedRoles={['administrator'] as UserRole[]}>
                    <FormTemplates />
                  </PrivateRoute>
                }
              />
              <Route
                path="/form-templates/new"
                element={
                  <PrivateRoute allowedRoles={['administrator'] as UserRole[]}>
                    <CreateFormTemplate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/collaborators"
                element={
                  <PrivateRoute allowedRoles={['administrator'] as UserRole[]}>
                    <Collaborators />
                  </PrivateRoute>
                }
              />
              <Route
                path="/collaborators/new"
                element={
                  <PrivateRoute allowedRoles={['administrator'] as UserRole[]}>
                    <CreateCollaborator />
                  </PrivateRoute>
                }
              />

              {/* Root routes */}
              <Route
                path="/root/form-templates"
                element={
                  <PrivateRoute allowedRoles={['root'] as UserRole[]}>
                    <RootFormTemplates />
                  </PrivateRoute>
                }
              />
               <Route
                path="/root/form-templates/new"
                element={
                  <PrivateRoute allowedRoles={['root'] as UserRole[]}>
                    <RootCreateFormTemplate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/companies"
                element={
                  <PrivateRoute allowedRoles={['root'] as UserRole[]}>
                    <Companies />
                  </PrivateRoute>
                }
              />
              <Route
                path="/companies/new"
                element={
                  <PrivateRoute allowedRoles={['root'] as UserRole[]}>
                    <CreateCompany />
                  </PrivateRoute>
                }
              />

              {/* Settings and Profile */}
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* Company and Collaborator Details */}
              <Route
                path="/companies/:id"
                element={
                  <PrivateRoute>
                    <CompanyDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/companies/:id/edit"
                element={
                  <PrivateRoute>
                    <EditCompany />
                  </PrivateRoute>
                }
              />
              <Route
                path="/collaborators/:id"
                element={
                  <PrivateRoute>
                    <CollaboratorDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/collaborators/:id/edit"
                element={
                  <PrivateRoute>
                    <EditCollaborator />
                  </PrivateRoute>
                }
              />

              {/* Form Template Details */}
              <Route
                path="/form-templates/:id"
                element={
                  <PrivateRoute>
                    <FormTemplateDetails />
                  </PrivateRoute>
                }
              />

              {/* Discussion route */}
              <Route
                path="/discussion/:id?"
                element={
                  <PrivateRoute allowedRoles={['administrator', 'technician', 'validator'] as UserRole[]}>
                    <Discussion />
                  </PrivateRoute>
                }
              />

              {/* Fallback route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </FormProvider> {/* Move FormProvider closing tag */}
        </AuthProvider> {/* Move AuthProvider closing tag */}
      </BrowserRouter>
      </I18nextProvider> {/* Add closing tag */}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
