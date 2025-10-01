import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  MoveUp,
  MoveDown,
  GripVertical
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

// Field type definitions with French labels
const fieldTypes = [
  { value: 'text', label: 'Champ Texte' }, // Translated
  { value: 'textarea', label: 'Zone de Texte' }, // Translated
  { value: 'select', label: 'Liste Déroulante' }, // Translated
  { value: 'checkbox', label: 'Case à Cocher' }, // Translated
  { value: 'radio', label: 'Boutons Radio' }, // Translated
  { value: 'number', label: 'Nombre' }, // Translated
  { value: 'date', label: 'Date' }, // Translated
  { value: 'datetime', label: 'Date et Heure' }, // Translated
  { value: 'file', label: 'Téléchargement de Fichier' }, // Translated
  { value: 'image', label: 'Téléchargement d\'Image' }, // Translated
];

const RootCreateFormTemplate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Use the rootcreateFormTemplate API call (keep comment)
  const { rootcreateFormTemplate } = useApi();

  const [formState, setFormState] = useState({
    title: '',
    description: '',
    fields: [
      {
        type: 'text',
        name: `field_${Date.now()}`,
        label: 'Champ sans titre', // Translated default label
        placeholder: '',
        description: '',
        required: false,
        options: [],
        isGrouped: false,
        groupName: '',
        numberType: 'float' // Add default number type (keep comment)
      }
    ]
  });

  const handleFieldChange = (index: number, key: string, value: any) => {
    const updatedFields = [...formState.fields];
    updatedFields[index] = {
      ...updatedFields[index],
      [key]: value
    };

    // If field type is changed, reset any type-specific properties (keep comment)
    if (key === 'type') {
      if (value !== 'select' && value !== 'radio' && value !== 'checkbox') {
        updatedFields[index].options = [];
        updatedFields[index].isGrouped = false;
        updatedFields[index].groupName = '';
      }
      // Reset numberType if the type is not 'number' (keep comment)
      if (value !== 'number') {
        updatedFields[index].numberType = 'float';
      }
    }

    // Generate a unique name for the field if type is changed (keep comment)
    if (key === 'type') {
      updatedFields[index].name = `${value}_${Date.now()}`;
    }

    setFormState({
      ...formState,
      fields: updatedFields
    });
  };

  const addField = () => {
    setFormState({
      ...formState,
      fields: [
        ...formState.fields,
        {
          type: 'text',
          name: `field_${Date.now()}`,
          label: 'Champ sans titre', // Translated default label
          placeholder: '',
          description: '',
          required: false,
          options: [],
          isGrouped: false,
          groupName: '',
          numberType: 'float' // Add default number type for new fields (keep comment)
        }
      ]
    });
  };

  const removeField = (index: number) => {
    if (formState.fields.length === 1) {
      toast({
        title: "Impossible de supprimer", // Translated
        description: "Le modèle de formulaire doit contenir au moins un champ", // Translated
        variant: "destructive",
      });
      return;
    }

    const updatedFields = [...formState.fields];
    updatedFields.splice(index, 1);

    setFormState({
      ...formState,
      fields: updatedFields
    });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formState.fields.length - 1)
    ) {
      return;
    }

    const updatedFields = [...formState.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap fields (keep comment)
    [updatedFields[index], updatedFields[targetIndex]] =
      [updatedFields[targetIndex], updatedFields[index]];

    setFormState({
      ...formState,
      fields: updatedFields
    });
  };

  const addOption = (fieldIndex: number) => {
    const updatedFields = [...formState.fields];
    const field = updatedFields[fieldIndex];

    if (!field.options) {
      field.options = [];
    }

    field.options.push({
      label: `Option ${field.options.length + 1}`, // Keep "Option" for dynamic label
      value: `option_${Date.now()}_${field.options.length}`
    });

    setFormState({
      ...formState,
      fields: updatedFields
    });
  };

  const updateOption = (fieldIndex: number, optionIndex: number, key: string, value: any) => {
    const updatedFields = [...formState.fields];
    const field = updatedFields[fieldIndex];

    field.options[optionIndex] = {
      ...field.options[optionIndex],
      [key]: value
    };

    setFormState({
      ...formState,
      fields: updatedFields
    });
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...formState.fields];
    const field = updatedFields[fieldIndex];

    if (field.options.length <= 1) {
      toast({
        title: "Impossible de supprimer", // Translated
        description: "Le champ doit avoir au moins une option", // Translated
        variant: "destructive",
      });
      return;
    }

    field.options.splice(optionIndex, 1);

    setFormState({
      ...formState,
      fields: updatedFields
    });
  };

  const validateForm = () => {
    if (!formState.title.trim()) {
      toast({
        title: "Erreur de validation", // Translated
        description: "Le titre du formulaire est requis", // Translated
        variant: "destructive",
      });
      return false;
    }

    for (let i = 0; i < formState.fields.length; i++) {
      const field = formState.fields[i];

      if (!field.label.trim()) {
        toast({
          title: "Erreur de validation", // Translated
          description: `Le champ n°${i + 1} n'a pas d'étiquette`, // Translated
          variant: "destructive",
        });
        return false;
      }

      if ((field.type === 'select' || field.type === 'radio' ||
           (field.type === 'checkbox' && field.isGrouped)) &&
          (!field.options || field.options.length === 0)) {
        toast({
          title: "Erreur de validation", // Translated
          description: `Le champ "${field.label}" doit avoir au moins une option`, // Translated
          variant: "destructive",
        });
        return false;
      }

      if ((field.type === 'radio' || field.type === 'checkbox') &&
          field.isGrouped && !field.groupName.trim()) {
        toast({
          title: "Erreur de validation", // Translated
          description: `Le champ groupé "${field.label}" doit avoir un nom de groupe`, // Translated
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Call API to create root form template (keep comment)
      await rootcreateFormTemplate({
        ...formState,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Modèle de formulaire racine créé", // Translated
        description: "Votre modèle de formulaire racine a été créé avec succès", // Translated
        variant: "default",
      });

      // Navigate to the root form templates list page (keep comment)
      navigate('/root/form-templates');
    } catch (error) {
      console.error('Erreur lors de la création du modèle de formulaire racine:', error); // Translated error log
      toast({
        title: "Erreur lors de la création du modèle racine", // Translated
        description: "Un problème est survenu lors de la création de votre modèle de formulaire racine", // Translated
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/root/form-templates')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux modèles racines {/* Translated */}
          </Button>

          <h1 className="text-2xl font-bold">Créer un modèle de formulaire racine</h1> {/* Translated */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Form Details */}
            <Card>
              <CardHeader>
                <CardTitle>Détails du formulaire</CardTitle> {/* Translated */}
                <CardDescription>Informations de base sur votre modèle de formulaire racine</CardDescription> {/* Translated */}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du formulaire</Label> {/* Translated */}
                  <Input
                    id="title"
                    placeholder="Ex: Formulaire d'inspection d'équipement" // Translated placeholder
                    value={formState.title}
                    onChange={(e) => setFormState({...formState, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label> {/* Translated */}
                  <Textarea
                    id="description"
                    placeholder="Décrivez l'objectif de ce formulaire" // Translated placeholder
                    value={formState.description}
                    onChange={(e) => setFormState({...formState, description: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Champs du formulaire</CardTitle> {/* Translated */}
                <CardDescription>Concevez votre formulaire en ajoutant et configurant des champs</CardDescription> {/* Translated */}
              </CardHeader>
              <CardContent className="space-y-6">
                {formState.fields.map((field, index) => (
                  <div key={index} className="border border-border rounded-md p-4 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <h3 className="text-md font-medium ml-2">Champ {index + 1}</h3> {/* Translated (with variable) */}
                      </div>

                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveField(index, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveField(index, 'down')}
                          disabled={index === formState.fields.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(index)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`field-type-${index}`}>Type de champ</Label> {/* Translated */}
                          <Select
                            value={field.type}
                            onValueChange={(value) => handleFieldChange(index, 'type', value)}
                          >
                            <SelectTrigger id={`field-type-${index}`}>
                              <SelectValue placeholder="Sélectionner le type de champ" /> {/* Translated */}
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label} {/* Already translated */}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`field-label-${index}`}>Étiquette du champ</Label> {/* Translated */}
                          <Input
                            id={`field-label-${index}`}
                            value={field.label}
                            onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`field-placeholder-${index}`}>Texte d'espace réservé</Label> {/* Translated */}
                        <Input
                          id={`field-placeholder-${index}`}
                          placeholder="Ex: Saisissez votre prénom" // Translated placeholder
                          value={field.placeholder}
                          onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`field-description-${index}`}>Texte d'aide (optionnel)</Label> {/* Translated */}
                        <Input
                          id={`field-description-${index}`}
                          placeholder="Instructions supplémentaires pour ce champ" // Translated placeholder
                          value={field.description}
                          onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id={`field-required-${index}`}
                          checked={field.required}
                          onCheckedChange={(checked) =>
                            handleFieldChange(index, 'required', Boolean(checked))
                          }
                        />
                        <Label htmlFor={`field-required-${index}`}>
                          Ce champ est requis {/* Translated */}
                        </Label>
                      </div>

                      {field.type === 'select' && (
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label>Options</Label> {/* Translated */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(index)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Ajouter une option {/* Translated */}
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {field.options && field.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <Input
                                  value={option.label}
                                  onChange={(e) =>
                                    updateOption(index, optionIndex, 'label', e.target.value)
                                  }
                                  placeholder={`Option ${optionIndex + 1}`} // Keep "Option"
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(index, optionIndex)}
                                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(field.type === 'checkbox' || field.type === 'radio') && (
                        <div className="pt-2">
                          <div className="flex items-center space-x-2 mb-4">
                            <Checkbox
                              id={`field-grouped-${index}`}
                              checked={field.isGrouped}
                              onCheckedChange={(checked) =>
                                handleFieldChange(index, 'isGrouped', Boolean(checked))
                              }
                            />
                            <Label htmlFor={`field-grouped-${index}`}>
                              Utiliser plusieurs options {/* Translated */}
                            </Label>
                          </div>

                          {field.isGrouped && (
                            <>
                              <div className="space-y-2 mb-4">
                                <Label htmlFor={`field-groupname-${index}`}>Nom du groupe</Label> {/* Translated */}
                                <Input
                                  id={`field-groupname-${index}`}
                                  placeholder="Ex: genre, préférences" // Translated placeholder
                                  value={field.groupName}
                                  onChange={(e) => handleFieldChange(index, 'groupName', e.target.value)}
                                />
                              </div>

                              <div className="flex items-center justify-between mb-2">
                                <Label>Options</Label> {/* Translated */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addOption(index)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Ajouter une option {/* Translated */}
                                </Button>
                              </div>

                              <div className="space-y-2">
                                {field.options && field.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <Input
                                      value={option.label}
                                      onChange={(e) =>
                                        updateOption(index, optionIndex, 'label', e.target.value)
                                      }
                                      placeholder={`Option ${optionIndex + 1}`} // Keep "Option"
                                      className="flex-1"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeOption(index, optionIndex)}
                                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {field.type === 'number' && (
                        <div className="space-y-2">
                          <Label htmlFor={`number-type-${index}`}>Type de nombre</Label> {/* Translated */}
                          <Select
                            value={field.numberType || 'float'} // Default to float if not set (keep comment)
                            onValueChange={(value) => handleFieldChange(index, 'numberType', value)}
                          >
                            <SelectTrigger id={`number-type-${index}`}>
                              <SelectValue placeholder="Sélectionner le type de nombre" /> {/* Translated */}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="integer">Entier</SelectItem> {/* Translated */}
                              <SelectItem value="float">Flottant</SelectItem> {/* Translated */}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addField}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un champ {/* Translated */}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu du formulaire</CardTitle> {/* Translated */}
                  <CardDescription>Comment votre formulaire apparaîtra aux utilisateurs</CardDescription> {/* Translated */}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-border rounded-md p-4 bg-muted/30">
                    <h3 className="font-medium text-lg mb-2">{formState.title || 'Formulaire sans titre'}</h3> {/* Translated */}
                    {formState.description && (
                      <p className="text-sm text-muted-foreground mb-4">{formState.description}</p>
                    )}

                    <div className="space-y-4">
                      {formState.fields.map((field, index) => (
                        <div key={index} className="space-y-2">
                          <Label className="flex items-center">
                            {field.label || `Champ ${index + 1}`} {/* Translated (with variable) */}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </Label>

                          {field.description && (
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          )}

                          {field.type === 'text' && (
                            <Input disabled placeholder={field.placeholder} />
                          )}

                          {field.type === 'textarea' && (
                            <Textarea disabled placeholder={field.placeholder} rows={3} />
                          )}

                          {field.type === 'select' && (
                            <Select disabled>
                              <SelectTrigger>
                                <SelectValue placeholder={field.placeholder || 'Sélectionner une option'} /> {/* Translated */}
                              </SelectTrigger>
                            </Select>
                          )}

                          {field.type === 'checkbox' && !field.isGrouped && (
                            <div className="flex items-center space-x-2">
                              <Checkbox id={`preview-checkbox-${index}`} disabled />
                              <Label htmlFor={`preview-checkbox-${index}`}>
                                {field.placeholder || 'Option de case à cocher'} {/* Translated */}
                              </Label>
                            </div>
                          )}

                          {field.type === 'checkbox' && field.isGrouped && (
                            <div className="space-y-2">
                              {field.options && field.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <Checkbox id={`preview-checkbox-${index}-${optionIndex}`} disabled />
                                  <Label htmlFor={`preview-checkbox-${index}-${optionIndex}`}>
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}

                          {field.type === 'radio' && (
                            <div className="space-y-2">
                              {field.options && field.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id={`preview-radio-${index}-${optionIndex}`}
                                    name={field.groupName || `preview-radio-group-${index}`}
                                    disabled
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor={`preview-radio-${index}-${optionIndex}`}>
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}

                          {field.type === 'number' && (
                            <Input
                              type="number"
                              disabled
                              placeholder={field.numberType === 'integer' ? '0' : '0.0'}
                            />
                          )}

                          {field.type === 'date' && (
                            <Input type="date" disabled />
                          )}

                          {field.type === 'datetime' && (
                            <Input type="datetime-local" disabled />
                          )}

                          {(field.type === 'file' || field.type === 'image') && (
                            <Input type="file" disabled />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enregistrement... {/* Translated */}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer le modèle {/* Translated */}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/root/form-templates')}
                  >
                    Annuler {/* Translated */}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RootCreateFormTemplate;