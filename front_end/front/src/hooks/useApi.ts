import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useCallback } from 'react';

// This hook provides API methods based on the user's role
export function useApi() {
  const { user } = useAuth();

  // Root API methods
  const createCompany = useCallback(async (data: unknown) => {
    return api.post('/companies', data);
  }, []);
    const rootcreateFormTemplate = useCallback(async (data: unknown) => {
    return api.post('/root/form-templates', data);
  }, []);
   const rootgetFormTemplate = useCallback(async (data: unknown) => {
    return api.get('/root/form-templates', data);
  }, []);

  const rootDeleteFormTemplate = useCallback(async (id: string) => {
    return api.delete(`/root/form-templates/${id}`);
  }, []);

  const rootAssignFormTemplateToCompany = useCallback(async (data: { form_template_id: string; company_email: string }) => {
    return api.post('/root/assign-form-template', data);
  }, []);

  const listCompanies = useCallback(async () => {
    return api.get('/companies');
  }, []);

  const getCompany = useCallback(async (id: string) => {
    return api.get(`/companies/${id}`);
  }, []);

  const updateCompany = useCallback(async (id: string, data: unknown) => {
    return api.put(`/companies/${id}`, data);
  }, []);

  const deactivateCompany = useCallback(async (id: string) => {
    return api.patch(`/companies/${id}/deactivate`);
  }, []);

  const activateCompany = useCallback(async (id: string) => {
    return api.put(`/companies/${id}/activate`);
  }, []);

  const deleteCompany = useCallback(async (id: string) => {
    return api.delete(`/companies/${id}`);
  }, []);

  // Admin API methods
  const createCollaborator = useCallback(async (data: unknown) => {
    return api.post('/collaborators', data);
  }, []);

  const listCollaborators = useCallback(async () => {
    return api.get('/collaborators');
  }, []);

  const getCollaborator = useCallback(async (id: string) => {
    return api.get(`/collaborators/${id}`);
  }, []);

  const updateCollaborator = useCallback(async (id: string, data: unknown) => {
    return api.put(`/collaborators/${id}`, data);
  }, []);

  const deactivateCollaborator = useCallback(async (id: string) => {
    return api.patch(`/collaborators/${id}/deactivate`);
  }, []);

  const activateCollaborator = useCallback(async (id: string) => {
    return api.put(`/collaborators/${id}/activate`);
  }, []);

  const deleteCollaborator = useCallback(async (id: string) => {
    return api.delete(`/collaborators/${id}`);
  }, []);

  const changeAdminPassword = useCallback(async (data: unknown) => {
    return api.put('/admin/change-password', data);
  }, []);

  const getAdminDiscussions = useCallback(async () => {
    return api.get('/admin/discussions');
  }, []);

  const createFormTemplate = useCallback(async (data: unknown) => {
    return api.post('/form-templates', data);
  }, []);

  const listFormTemplates = useCallback(async () => {
    return api.get('/form-templates');
  }, []);

  const getFormTemplate = useCallback(async (id: string) => {
    return api.get(`/form-templates/${id}`);
  }, []);

  const deleteFormTemplate = useCallback(async (id: string) => {
    return api.delete(`/form-templates/${id}`);
  }, []);

  const assignForm = useCallback(async (data: unknown) => {
    // Don't format the data - just pass it through as-is
    console.log('Sending to API:', data);
    return api.post('/form-assignments', data);
  }, []);

  const listAssignments = useCallback(async () => {
    return api.get('/form-assignments');
  }, []);

  const getAdminDashboardStats = useCallback(async () => {
    return api.get('/admin/dashboard');
  }, []);

  const assignValidatorToTechnicians = useCallback(async (data: { form_template_id: string; validator_id: string; technician_ids: string[] }) => {
    // TODO: Define the correct backend endpoint
    return api.post('/admin/assign-validator-technicians', data);
  }, []);



  // Collaborator API methods
  const listAssignedForms = useCallback(async () => {
    return api.get('/assigned-forms');
  }, []);

  const listSubmissions = useCallback(async (params?: { userId?: string }) => {
    return api.get('/form-submissions', { params });
  }, []);

  const getSubmission = useCallback(async (id: string) => {
    return api.get(`/form-submissions/${id}`);
  }, []);

  const getCollaboratorFormTemplate = useCallback(async (id: string) => {
    return api.get(`/assigned-forms/${id}`);
  }, []);

  const createFormSubmission = useCallback(async (data: FormData) => {
    return api.post('/form-submissions', data, {
      headers: {
        'Content-Type': 'multipart/form-data', // Explicitly set for clarity, though Axios often handles this
      },
    });
  }, []);

  const updateFormSubmission = useCallback(async (id: string, data: FormData) => {
    // Use POST for FormData with PUT semantic, as PUT with FormData can be tricky
    // Laravel can handle PUT/PATCH with FormData if configured, but POST is more reliable
    // We'll indicate the intended method in the FormData if needed by the backend,
    // but for now, the backend is expecting PUT/PATCH based on the route definition.
    // Let's stick to PUT for now and see if it works with the backend setup.
    // If not, we might need to send a _method=PUT field in FormData and use POST.
    return api.post(`/form-submissions/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }, []);

  const getCollaboratorDashboardStats = useCallback(async () => {
    return api.get('/collaborator/dashboard');
  }, []);

  const changeCollaboratorPassword = useCallback(async (data: { old_password: string; new_password: string }) => {
    return api.put('/collaborator/change-password', data);
  }, []);

  // Validator-only API methods
  const validateFormSubmission = useCallback(async (id: string, data: object) => {
    return api.patch(`/form-submissions/${id}/validate`, data);
  }, []);

  const refuseFormSubmission = useCallback(async (id: string, data: object) => {
    return api.patch(`/form-submissions/${id}/refuse`, data);
  }, []);

  const listSubmissionsForValidation = useCallback(async () => {
    return api.get('/validator/submissions-for-validation');
  }, []);

  const listRefusedSubmissionsForValidator = useCallback(async () => {
    return api.get('/validator/refused-submissions'); // Assuming a new endpoint for refused submissions for validators
  }, []);

  const getCollaboratorMessageRecipients = useCallback(async () => {
    return api.get('/collaborator/message-recipients');
  }, []);

  const getFormSubmissionContent = useCallback(async (id: string) => {
    return api.get(`/form-submissions/${id}/content`);
  }, []);

  return {
    // Auth methods


    // Root methods
    createCompany,
    listCompanies,
    getCompany,
    updateCompany,
    deactivateCompany,
    activateCompany,
    deleteCompany,
    rootDeleteFormTemplate,

    // Admin methods
    createCollaborator,
    listCollaborators,
    getCollaborator,
    updateCollaborator,
    deactivateCollaborator,
    activateCollaborator,
    deleteCollaborator,
    changeAdminPassword,
    createFormTemplate,
    listFormTemplates,
    getFormTemplate,
    deleteFormTemplate,
    assignForm,
    listAssignments,
    getAdminDashboardStats,
    getAdminDiscussions,

    // Collaborator methods
    listAssignedForms,
    listSubmissions,
    getSubmission, // Added getSubmission here
    getCollaboratorFormTemplate,
    createFormSubmission,
    updateFormSubmission,
    getCollaboratorDashboardStats,
    changeCollaboratorPassword,
    getCollaboratorMessageRecipients, // Export the new function

    // Validator methods
    validateFormSubmission,
    refuseFormSubmission, // Add the new method here
    listSubmissionsForValidation,
    listRefusedSubmissionsForValidator, // Add the new method here
    getFormSubmissionContent,
    rootcreateFormTemplate,
    rootgetFormTemplate,
    rootAssignFormTemplateToCompany,

    // New Admin method
    assignValidatorToTechnicians,

    // Discussion methods
    getUserDiscussions: useCallback(async () => {
      return api.get('/user/discussions');
    }, []),

    getDiscussionById: useCallback(async (id: string) => {
      return api.get(`/discussions/${id}`);
    }, []),

    getDiscussionMessages: useCallback(async (id: string) => {
      return api.get(`/discussions/${id}/messages`);
    }, []),

    markDiscussionAsRead: useCallback(async (id: string) => {
      return api.patch(`/discussions/${id}/read`);
    }, []),

    // Updated sendMessage to accept parameters for both creating a new discussion and sending a message
    sendMessage: useCallback(async (data: {
      discussion_id?: number; // For sending messages within an existing discussion
      recipient_id?: number | null; // For sending messages within an existing discussion
      content?: string; // For sending messages within an existing discussion
      form_submission_id?: number | null; // For creating a new discussion
      user_id?: number; // For creating a new discussion
      message?: string; // For creating a new discussion
    }) => {
      // Determine the payload based on whether discussion_id is provided
      const payload = data.discussion_id
        ? { discussion_id: data.discussion_id, recipient_id: data.recipient_id, content: data.content }
        : { recipient_id: data.recipient_id, content: data.content }; // Corrected payload for new discussions

      return api.post('/discussions', payload);
    }, []),

    user, // Expose the authenticated user
  };
}
