import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import Layout from '@/components/Layout';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  ArrowLeft, 
  Save, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
// import FormTemplates from './FormTemplates'; // Assuming this might be needed later, keeping it commented

const FormSubmission = () => {
  const { mode, id } = useParams(); // mode can be 'new' or 'edit'
  const navigate = useNavigate();
  const location = useLocation(); // Add useLocation to access state passed via navigation
  const api = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  // Define a type for checkbox group values (keep comment)
  interface CheckboxGroupValue {
    [key: string]: boolean;
  }

  interface FormContentType {
    [key: string]: string | boolean | CheckboxGroupValue | undefined;
  }
  
  const [formContent, setFormContent] = useState<FormContentType>({}); // Store form field values (keep comment)
  const [formFields, setFormFields] = useState([]); // Form fields from template (keep comment)
  const [validationErrors, setValidationErrors] = useState({});
  
  useEffect(() => {
    const loadFormData = async () => {
      setIsLoading(true);
      try {
        // Check if submission data was passed through location state (keep comment)
        const submissionFromState = location.state?.submissionData;
        
        if (mode === 'edit') {
          let submission = null;
          
          // First try to use submission data from navigation state if available (keep comment)
          if (submissionFromState) {
            submission = submissionFromState;
          } else {
            // Otherwise fetch it from the API (keep comment)
            const submissionsRes = await api.listSubmissions();
            submission = submissionsRes.data.find(sub => sub.id === id);
          }
          
          if (!submission) {
            throw new Error("Soumission introuvable"); // Translated error
          }

          // Determine if form should be read-only (for 'submitted' or 'validated' status) (keep comment)
          const isSubmittedOrValidated = submission.status === 'submitted' || submission.status === 'validated';
          setIsReadOnly(isSubmittedOrValidated);

          setFormData(submission);
          
          // Process form data to handle boolean values for checkboxes (keep comment)
          const processedFormData = { ...submission.form_data || {} };
          
          // Convert string 'true'/'false' values to actual booleans for checkboxes (keep comment)
          Object.keys(processedFormData).forEach(key => {
            if (processedFormData[key] === 'true') {
              processedFormData[key] = true;
            } else if (processedFormData[key] === 'false') {
              processedFormData[key] = false;
            }
          });
          
          setFormContent(processedFormData);
          
          // Get the template to show form fields (keep comment)
          const templateId = submission.form_template_id || submission.formTemplateId;
          if (templateId) {
            const templateRes = await api.getCollaboratorFormTemplate(templateId);
            const template = templateRes.data;
            
            // Extract fields from the template (keep comment)
            if (template && template.fields) {
              let fields;

              // Handle different possible format of fields (string or already parsed) (keep comment)
              if (typeof template.fields === 'string') {
                try {
                  fields = JSON.parse(template.fields);
                } catch (e) {
                  console.error('Erreur lors de l\'analyse des champs du modèle:', e); // Translated error
                  fields = [];
                }
              } else {
                fields = template.fields;
              }

              // Modify checkbox fields with options to be radio buttons (keep comment)
              const processedFields = fields.map(field => {
                if (field.type === 'checkbox' && field.options && field.options.length > 0) {
                  return { ...field, type: 'radio' };
                }
                return field;
              });

              setFormFields(processedFields);
            }
          }
        } else if (mode === 'new') {
          // Get form template for a new submission (keep comment)
          const templateRes = await api.getCollaboratorFormTemplate(id);
          const template = templateRes.data;
          setFormData(template);

          // Extract fields from the template (keep comment)
          if (template && template.fields) {
            let fields;

            // Handle different possible format of fields (keep comment)
            if (typeof template.fields === 'string') {
              try {
                fields = JSON.parse(template.fields);
              } catch (e) {
                console.error('Erreur lors de l\'analyse des champs du modèle:', e); // Translated error
                fields = [];
              }
            } else {
              fields = template.fields;
            }

            // Modify checkbox fields with options to be radio buttons (keep comment)
            const processedFields = fields.map(field => {
              if (field.type === 'checkbox' && field.options && field.options.length > 0) {
                return { ...field, type: 'radio' };
              }
              return field;
            });

            setFormFields(processedFields);
          }

          // Initialize empty form content (keep comment)
          const initialFormContent = {};

          // Set default values for checkboxes and radio buttons (keep comment)
          if (template && template.fields) {
            let fields;
            if (typeof template.fields === 'string') {
              try {
                fields = JSON.parse(template.fields);
              } catch (e) {
                fields = [];
              }
            } else {
              fields = template.fields;
            }

            fields.forEach(field => {
              // Use the potentially modified field type
              if (field.type === 'checkbox') {
                initialFormContent[field.name] = field.defaultChecked || false;
              } else if (field.type === 'radio') {
                initialFormContent[field.name] = field.defaultValue || '';
              }
            });
          }

          setFormContent(initialFormContent);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du formulaire:', error); // Translated error
        toast({
          title: "Erreur", // Translated
          description: "Impossible de charger les données du formulaire", // Translated
          variant: "destructive",
        });
        navigate('/forms');
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [id, mode, location.state]);

  const handleInputChange = (field, value) => {
    // Don't allow changes if in read-only mode (keep comment)
    if (isReadOnly) return;

    // Clear validation error when field is modified (keep comment)
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }

    setFormContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Basic validation - check required fields (keep comment)
    formFields.forEach(field => {
        if (field.required) {
          if (field.type === 'checkbox') {
            // For required checkboxes, they must be checked (keep comment)
            // Removed && field.requiredToBeChecked to fix no-constant-binary-expression
            if (field.required && formContent[field.name] !== true) {
              errors[field.name] = 'Cette case doit être cochée'; // Translated error
              isValid = false;
            }
          } else if (field.type === 'radio') {
            // For required radio buttons, one must be selected (keep comment)
            if (!formContent[field.name]) { // This check seems sufficient for required radio
            errors[field.name] = 'Veuillez sélectionner une option'; // Translated error
            isValid = false;
          }
        } else if (!formContent[field.name] && formContent[field.name] !== false) {
          errors[field.name] = 'Ce champ est requis'; // Translated error
          isValid = false;
        } else if (typeof formContent[field.name] === 'string' && (formContent[field.name] as string).trim() === '') {
          errors[field.name] = 'Ce champ est requis'; // Translated error
          isValid = false;
        }
      }
    });
    
    // If no fields (fallback form), validate some basic fields (keep comment)
    if (formFields.length === 0) {
      if (!formContent.title || (typeof formContent.title === 'string' && formContent.title.trim() === '')) {
        errors['title'] = 'Le titre est requis'; // Translated error
        isValid = false;
      }
      
      if (!formContent.notes || (typeof formContent.notes === 'string' && formContent.notes.trim() === '')) {
        errors['notes'] = 'Les notes sont requises'; // Translated error
        isValid = false;
      }
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSaveDraft = async () => {
    if (isReadOnly) return;
    
    setIsSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('status', 'draft');

      // For PUT/PATCH requests with FormData in Laravel, include _method field
      if (mode === 'edit') {
        formDataToSend.append('_method', 'PUT');
      }
     
      const formContentJson: { [key: string]: unknown } = {};
      for (const key in formContent) {
        if (Object.prototype.hasOwnProperty.call(formContent, key)) {
          const field = formFields.find(f => f.name === key);
          if (field && (field.type === 'file' || field.type === 'image')) {
            
            if (formContent[key] instanceof File) {
              formDataToSend.append(key, formContent[key] as File);
            }
          } else {
           
            formContentJson[key] = formContent[key];
          }
        }
      }
      formDataToSend.append('form_data', JSON.stringify(formContentJson));


      if (mode === 'edit') {
        await api.updateFormSubmission(id, formDataToSend);
        
        // Update local state (Note: file inputs won't show the new file name immediately without refetching) (keep comment)
        setFormData(prev => ({
          ...prev,
          form_data: formContent, // This might not be entirely accurate for files until refetch
          status: 'draft'
        }));
        
      } else {
        // If new, create submission then redirect to edit mode (keep comment)
        formDataToSend.append('form_template_id', id);
        const response = await api.createFormSubmission(formDataToSend);
        
        if (response.data && response.data.id) {
          navigate(`/form-submission/edit/${response.data.id}`, { replace: true });
        }
      }

      toast({
        title: "Succès", // Translated
        description: "Brouillon du formulaire enregistré avec succès", // Translated
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du brouillon du formulaire:', error); // Translated error
      toast({
        title: "Erreur", // Translated
        description: "Impossible d'enregistrer le brouillon du formulaire", // Translated
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;
    
    // Validate form before submission (keep comment)
    if (!validateForm()) {
      toast({
        title: "Erreur de validation", // Translated
        description: "Veuillez remplir tous les champs requis", // Translated
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('status', 'submitted');
      formDataToSend.append('submitted_at', new Date().toISOString());

      // For PUT/PATCH requests with FormData in Laravel, include _method field
      if (mode === 'edit') {
        formDataToSend.append('_method', 'PUT');
      }

      // Append non-file form data (keep comment)
      const formContentJson: { [key: string]: unknown } = {};
      for (const key in formContent) {
        if (Object.prototype.hasOwnProperty.call(formContent, key)) {
          const field = formFields.find(f => f.name === key);
          if (field && (field.type === 'file' || field.type === 'image')) {
            // Append file directly (keep comment)
            if (formContent[key] instanceof File) {
              formDataToSend.append(key, formContent[key] as File);
            }
          } else {
            // Append other data as JSON string (keep comment)
            formContentJson[key] = formContent[key];
          }
        }
      }
      formDataToSend.append('form_data', JSON.stringify(formContentJson));


      if (mode === 'edit') {
        await api.updateFormSubmission(id, formDataToSend);
      } else {
        // If new, create submission with submitted status (keep comment)
        formDataToSend.append('form_template_id', id);
        await api.createFormSubmission(formDataToSend);
      }

      toast({
        title: "Succès", // Translated
        description: "Formulaire soumis avec succès", // Translated
      });
      
      // Navigate back to forms page (keep comment)
      navigate('/forms');
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error); // Translated error
      toast({
        title: "Erreur", // Translated
        description: "Impossible de soumettre le formulaire", // Translated
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderFormField = (field) => {
    const hasError = !!validationErrors[field.name];
    
    switch (field.type) {
      case 'radio':
        // Handle radio button groups like sex selection (keep comment)
        return (
          <div key={field.name} className="space-y-3">
            <label className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <RadioGroup
              value={String(formContent[field.name] || '')}
              onValueChange={(value) => handleInputChange(field.name, value)}
              disabled={isReadOnly}
            >
              {field.options && field.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                  <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && (
              <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
            )}
          </div>
        );
        
      case 'checkbox':
      
        if (field.options && field.options.length > 0) {
          return (
            <div key={field.name} className="space-y-3">
              <label className="block text-sm font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option.value}`}
                    name={field.name}
                    
                    checked={formContent[field.name]?.[option.value] === true}
                    onCheckedChange={(checked) => {
                      
                      setFormContent(prev => ({
                        ...prev,
                        [field.name]: {
                          ...((prev[field.name] as FormContentType) || {}),
                          [option.value]: checked
                        }
                      }));
                      
                      // Clear validation error if this checkbox is required and now checked (keep comment)
                      if (field.required && checked && validationErrors[field.name]) {
                         setValidationErrors(prev => {
                            const newErrors = {...prev};
                            delete newErrors[field.name];
                            return newErrors;
                         });
                      }
                    }}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
              {hasError && (
                <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
              )}
            </div>
          );
        } else {
          // Handle single checkboxes (keep comment)
          return (
            <div key={field.name} className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                name={field.name}
                checked={formContent[field.name] === true}
                onCheckedChange={(checked) => handleInputChange(field.name, checked)}
                disabled={isReadOnly}
              />
              <label 
                htmlFor={field.name} 
                className={`text-sm font-medium ${hasError ? 'text-red-500' : ''}`}
              >
                {field.label} {field.required && field.requiredToBeChecked && <span className="text-red-500">*</span>}
              </label>
              {hasError && (
                <p className="text-sm text-red-500 ml-2">{validationErrors[field.name]}</p>
              )}
            </div>
          );
        }
        
      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={field.name}
              name={field.name}
              value={String(formContent[field.name] || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${hasError ? 'border-red-500' : ''}`}
              disabled={isReadOnly}
            >
              <option value="">Sélectionner une option</option> {/* Translated default */}
              {field.options && field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
            )}
          </div>
        );
      
      case 'text':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="text"
              id={field.name}
              name={field.name}
              placeholder={field.placeholder || ''}
              value={String(formContent[field.name] || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              disabled={isReadOnly}
            />
            {hasError && (
              <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder || ''}
              value={String(formContent[field.name] || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              rows={field.rows || 4}
              disabled={isReadOnly}
            />
            {hasError && (
              <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="number"
              id={field.name}
              name={field.name}
              placeholder={field.placeholder || ''}
              value={String(formContent[field.name] || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              min={field.min}
              max={field.max}
              disabled={isReadOnly}
            />
            {hasError && (
              <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
            )}
          </div>
        );
      
      case 'email':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="email"
              id={field.name}
              name={field.name}
              placeholder={field.placeholder || ''}
              value={String(formContent[field.name] || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              disabled={isReadOnly}
            />
            {hasError && (
              <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
            )}
          </div>
        );
      
      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="date"
              id={field.name}
              name={field.name}
              value={String(formContent[field.name] || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              disabled={isReadOnly}
            />
            {hasError && (
              <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
            )}
          </div>
        );

      case 'datetime':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="datetime-local"
              id={field.name}
              name={field.name}
              value={String(formContent[field.name] || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              disabled={isReadOnly}
            />
            {hasError && (
              <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
            )}
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="file"
              id={field.name}
              name={field.name}
              onChange={(e) => handleInputChange(field.name, e.target.files ? e.target.files[0] : null)}
              className={hasError ? 'border-red-500' : ''}
              disabled={isReadOnly}
              accept={field.type === 'image' ? 'image/*' : '*/*'}
              multiple 
            />
           
            {mode === 'edit' && formContent[field.name] && typeof formContent[field.name] === 'string' && (
                <p className="text-sm text-gray-500">Fichier actuel: <a href={formContent[field.name] as string} target="_blank" rel="noopener noreferrer">{formContent[field.name] as string}</a></p> // Translated
            )}
            {hasError && (
              <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
            )}
          </div>
        );
        
      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="text"
              id={field.name}
              name={field.name}
              placeholder={field.placeholder || ''}
              value={String(formContent[field.name] || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              disabled={isReadOnly}
            />
            {hasError && (
              <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
            )}
          </div>
        );
    }
  };


  const renderSexField = () => {
    const hasError = !!validationErrors['sexe'];
    
    return (
      <div key="sexe" className="space-y-3">
        <label className="block text-sm font-medium">
          Sexe {false && <span className="text-red-500">*</span>} {/* Translated */}
        </label>
        <RadioGroup
          value={String(formContent['sexe'] || '')}
          onValueChange={(value) => handleInputChange('sexe', value)}
          disabled={isReadOnly}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="sex-male" />
            <Label htmlFor="sex-male">Masculin</Label> {/* Translated */}
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="sex-female" />
            <Label htmlFor="sex-female">Féminin</Label> {/* Translated */}
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="sex-other" />
            <Label htmlFor="sex-other">Autre</Label> {/* Translated */}
          </div>
        </RadioGroup>
        {hasError && (
          <p className="text-sm text-red-500">{validationErrors['sex']}</p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement du formulaire...</span> {/* Translated */}
          </div>
        </div>
      </Layout>
    );
  }

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
              {formData?.title || "Formulaire sans titre"} {/* Translated default */}
            </h1>
          </div>
          
          {!isReadOnly && (
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Enregistrer le brouillon {/* Translated */}
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Soumettre le formulaire {/* Translated */}
              </Button>
            </div>
          )}
        </div>
        
        {isReadOnly && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 font-medium">
              Ce formulaire a été {formData?.status === 'validated' ? 'validé' : 'soumis'} et est maintenant en lecture seule. {/* Translated */}
            </p>
          </div>
        )}
        
        {Object.keys(validationErrors).length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-600">Veuillez corriger les erreurs suivantes :</h3> {/* Translated */}
                <ul className="list-disc pl-5 mt-1 text-sm text-red-600">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>
                      {formFields.find(f => f.name === field)?.label || field}: {error}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          {formData?.description && (
            <div className="mb-6 text-gray-600 border-l-4 border-primary/20 pl-4 py-2">
              {formData.description}
            </div>
          )}
          
          {formFields.length > 0 ? (
            <div className="space-y-6">
              {formFields.map(field => {
                // Special handling for sex field - check if the field name is 'sex' (keep comment)
                if (field.name === 'sex') {
                  // If it doesn't have proper options, render our custom sex field (keep comment)
                  if (!field.options || field.options.length === 0) {
                    return renderSexField();
                  }
                }
                return renderFormField(field);
              })}
            </div>
          ) : (
            // If no fields are available, render a fallback form (keep comment)
            // This could happen if the template is misconfigured (keep comment)
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Titre <span className="text-red-500">*</span> {/* Translated */}
                </label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Titre du formulaire" // Translated placeholder
                  value={String(formContent.title || '')}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={validationErrors['title'] ? 'border-red-500' : ''}
                  disabled={isReadOnly}
                />
                {validationErrors['title'] && (
                  <p className="text-sm text-red-500">{validationErrors['title']}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Description du formulaire" // Translated placeholder
                  value={String(formContent.description || '')}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  disabled={isReadOnly}
                />
              </div>
              
              {/* Add sex field with radio options (keep comment) */}
              {renderSexField()}
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Notes <span className="text-red-500">*</span> {/* Translated */}
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Notes supplémentaires" // Translated placeholder
                  value={String(formContent.notes || '')}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={6}
                  className={validationErrors['notes'] ? 'border-red-500' : ''}
                  disabled={isReadOnly}
                />
                {validationErrors['notes'] && (
                  <p className="text-sm text-red-500">{validationErrors['notes']}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FormSubmission;
