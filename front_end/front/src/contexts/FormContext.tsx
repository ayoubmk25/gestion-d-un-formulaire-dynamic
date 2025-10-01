import React, { createContext, useContext, useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';

export type FormStatus = 'draft' | 'saisi' | 'validé';
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select, checkbox, radio
  placeholder?: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdBy: string;
  createdAt: string;
  company: string;
}

export interface FormSubmission {
  id: string;
  formTemplateId: string;
  submittedBy: string;
  submittedAt: string;
  status: FormStatus;
  values: Record<string, unknown>;
  validatedBy?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormAssignment {
  id: string;
  formTemplateId: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
}

interface FormContextType {
  templates: FormTemplate[];
  submissions: FormSubmission[];
  assignments: FormAssignment[];
  loadTemplates: () => Promise<void>;
  loadSubmissions: () => Promise<void>;
  loadAssignments: () => Promise<void>;
  createTemplate: (template: Omit<FormTemplate, 'id' | 'createdAt'>) => Promise<FormTemplate>;
  submitForm: (submission: Omit<FormSubmission, 'id' | 'submittedAt'>) => Promise<FormSubmission>;
  updateSubmissionStatus: (id: string, status: FormStatus) => Promise<FormSubmission>;
  assignForm: (assignment: Omit<FormAssignment, 'id' | 'assignedAt'>) => Promise<FormAssignment>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Mock data for demonstration
const mockTemplates: FormTemplate[] = [
  {
    id: '1',
    title: 'Equipment Inspection',
    description: 'Form for regular equipment inspection',
    fields: [
      { id: 'equip_id', label: 'Equipment ID', type: 'text', required: true },
      { id: 'inspection_date', label: 'Inspection Date', type: 'date', required: true },
      { id: 'status', label: 'Status', type: 'select', required: true, options: ['Operational', 'Needs Maintenance', 'Out of Service'] },
      { id: 'notes', label: 'Notes', type: 'textarea', required: false }
    ],
    createdBy: '2',
    createdAt: new Date().toISOString(),
    company: 'ACME Inc.'
  },
  {
    id: '2',
    title: 'Customer Satisfaction Survey',
    description: 'Survey for customer feedback',
    fields: [
      { id: 'cust_name', label: 'Customer Name', type: 'text', required: true },
      { id: 'service_date', label: 'Service Date', type: 'date', required: true },
      { id: 'satisfaction', label: 'Overall Satisfaction', type: 'radio', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
      { id: 'recommendation', label: 'Would you recommend our service?', type: 'checkbox', required: true },
      { id: 'feedback', label: 'Additional Feedback', type: 'textarea', required: false }
    ],
    createdBy: '2',
    createdAt: new Date().toISOString(),
    company: 'ACME Inc.'
  }
];

const mockSubmissions: FormSubmission[] = [
  {
    id: '1',
    formTemplateId: '1',
    submittedBy: '4',
    submittedAt: new Date().toISOString(),
    status: 'saisi',
    values: {
      'equip_id': 'EQ-1234',
      'inspection_date': '2023-06-15',
      'status': 'Operational',
      'notes': 'Regular maintenance performed, all systems functional'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    formTemplateId: '2',
    submittedBy: '4',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'validé',
    values: {
      'cust_name': 'Acme Corporation',
      'service_date': '2023-06-10',
      'satisfaction': 'Very Satisfied',
      'recommendation': true,
      'feedback': 'Excellent service, technician was very professional'
    },
    validatedBy: '3',
    validatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockAssignments: FormAssignment[] = [
  {
    id: '1',
    formTemplateId: '1',
    assignedTo: '4',
    assignedBy: '2',
    assignedAt: new Date(Date.now() - 172800000).toISOString(),
    dueDate: new Date(Date.now() + 604800000).toISOString() // Due in one week
  },
  {
    id: '2',
    formTemplateId: '2',
    assignedTo: '4',
    assignedBy: '2',
    assignedAt: new Date(Date.now() - 259200000).toISOString(),
    dueDate: new Date(Date.now() + 432000000).toISOString() // Due in five days
  }
];

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>(mockSubmissions);
  const [assignments, setAssignments] = useState<FormAssignment[]>(mockAssignments);

  const { user } = useAuth();
  const api = useApi();

  const loadTemplates = useCallback(async () => {
    try {
      if (user && user.role === 'root') { // Add check for user
        const response = await api.rootgetFormTemplate({}); // Pass an empty object if no data is needed
        setTemplates(response.data || []);
      } else {
        // Handle loading templates for other roles if needed
        // For now, keep mock data or fetch based on user role
        setTemplates(mockTemplates); // Keep mock data for other roles for now
      }
    } catch (error) {
      console.error('Error loading form templates:', error);
      setTemplates([]); // Set to empty array on error
    }
  }, [user, api]); // Update dependencies

  const loadSubmissions = async () => {
    // In a real app, this would fetch from API
    setSubmissions(mockSubmissions);
  };

  const loadAssignments = async () => {
    // In a real app, this would fetch from API
    setAssignments(mockAssignments);
  };

  const createTemplate = async (template: Omit<FormTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: FormTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    setTemplates([...templates, newTemplate]);
    return newTemplate;
  };

  const submitForm = async (submission: Omit<FormSubmission, 'id' | 'submittedAt'>) => {
    const newSubmission: FormSubmission = {
      ...submission,
      id: `submission-${Date.now()}`,
      submittedAt: new Date().toISOString()
    };
    
    setSubmissions([...submissions, newSubmission]);
    return newSubmission;
  };

  const updateSubmissionStatus = async (id: string, status: FormStatus) => {
    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          status,
          ...(status === 'validé' ? {
            validatedBy: '3', // In a real app, this would be the current user ID
            validatedAt: new Date().toISOString()
          } : {})
        };
      }
      return sub;
    });
    
    setSubmissions(updatedSubmissions);
    return updatedSubmissions.find(sub => sub.id === id) as FormSubmission;
  };

  const assignForm = async (assignment: Omit<FormAssignment, 'id' | 'assignedAt'>) => {
    const newAssignment: FormAssignment = {
      ...assignment,
      id: `assignment-${Date.now()}`,
      assignedAt: new Date().toISOString()
    };
    
    setAssignments([...assignments, newAssignment]);
    return newAssignment;
  };

  return (
    <FormContext.Provider
      value={{
        templates,
        submissions,
        assignments,
        loadTemplates,
        loadSubmissions,
        loadAssignments,
        createTemplate,
        submitForm,
        updateSubmissionStatus,
        assignForm
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
