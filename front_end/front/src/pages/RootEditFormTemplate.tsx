import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';
import { ArrowLeft, Loader2, Save, PlusCircle, MinusCircle } from 'lucide-react'; // Explicitly import icons

interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  fields: any[];
}

const RootEditFormTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/root/form-templates/${id}`);
        setTemplate(response.data);
      } catch (error) {
        console.error('Error loading root form template:', error);
        toast({
          title: "Error loading form template",
          description: "There was a problem loading the form template details.",
          variant: "destructive",
        });
        navigate('/root/form-templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      return { ...prevTemplate, [name]: value };
    });
  };

  const handleFieldChange = (index: number, fieldName: string, value: any) => {
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      const updatedFields = [...prevTemplate.fields];
      updatedFields[index] = { ...updatedFields[index], [fieldName]: value };
      return { ...prevTemplate, fields: updatedFields };
    });
  };

  const handleAddField = () => {
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      const newField = {
        name: '',
        type: 'text', // Default type
        label: '',
        required: false,
        options: [],
      };
      return { ...prevTemplate, fields: [...prevTemplate.fields, newField] };
    });
  };

  const handleRemoveField = (index: number) => {
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      const updatedFields = prevTemplate.fields.filter((_, i) => i !== index);
      return { ...prevTemplate, fields: updatedFields };
    });
  };


  const handleSaveTemplate = async () => {
    if (!template || isSaving) return;

    setIsSaving(true);
    try {
      await api.put(`/root/form-templates/${template.id}`, template);
      toast({
        title: "Form template updated",
        description: "The form template has been successfully updated.",
      });
      navigate(`/root/form-templates/${template.id}`);
    } catch (error) {
      console.error('Error saving root form template:', error);
      toast({
        title: "Error saving form template",
        description: "There was a problem saving the form template.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading form template...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!template) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Form template not found</h2>
            <p className="text-muted-foreground mb-6">The form template you are looking for does not exist or you do not have permission to view it.</p>
            <Button onClick={() => navigate('/root/form-templates')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to form templates
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(`/root/form-templates/${template.id}`)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit: {template.title}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Form Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={template.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={template.description || ''}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Fields</h3>
                <Button variant="outline" size="sm" onClick={handleAddField}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
              <div className="space-y-4">
                {template.fields.map((field, index) => (
                  <Card key={index} className="p-4">
                    <CardContent className="space-y-4">
                      <div className="flex justify-end">
                         <Button variant="ghost" size="sm" onClick={() => handleRemoveField(index)}>
                            <MinusCircle className="h-4 w-4 text-red-500" />
                         </Button>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`field-label-${index}`}>Label</Label>
                        <Input
                          id={`field-label-${index}`}
                          value={field.label}
                          onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`field-name-${index}`}>Name (Internal)</Label>
                        <Input
                          id={`field-name-${index}`}
                          value={field.name}
                          onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`field-type-${index}`}>Type</Label>
                        {/* You might want to use a select input here for type */}
                        <Input
                          id={`field-type-${index}`}
                          value={field.type}
                          disabled // Type should likely not be editable after creation
                        />
                      </div>
                      {field.type === 'select' || field.type === 'checkbox' || field.type === 'radio' ? (
                        <div className="space-y-2">
                          <Label htmlFor={`field-options-${index}`}>Options (comma-separated)</Label>
                          <Input
                            id={`field-options-${index}`}
                            value={field.options ? field.options.map((opt: any) => typeof opt === 'string' ? opt : opt.label).join(', ') : ''}
                            onChange={(e) => handleFieldChange(index, 'options', e.target.value.split(',').map((opt: string) => opt.trim()))}
                          />
                        </div>
                      ) : null}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`field-required-${index}`}
                          checked={field.required}
                          onCheckedChange={(checked) => handleFieldChange(index, 'required', checked)}
                        />
                        <Label htmlFor={`field-required-${index}`}>Required</Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RootEditFormTemplate;
