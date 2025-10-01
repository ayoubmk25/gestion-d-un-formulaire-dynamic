
import React, { useState } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { FieldType, FormField } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, GripVertical, Plus, Settings } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FormBuilderProps {
  initialFields?: FormField[];
  onSave: (fields: FormField[]) => void;
}

const fieldTypeOptions: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'date', label: 'Date Picker' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
];

const FormBuilder: React.FC<FormBuilderProps> = ({ initialFields = [], onSave }) => {
  const [fields, setFields] = useState<FormField[]>(initialFields.length > 0 ? initialFields : [
    { id: uuidv4(), label: 'Question', type: 'text', required: false }
  ]);
  const [editingOptions, setEditingOptions] = useState<string | null>(null);
  const [optionInput, setOptionInput] = useState('');

  const addField = () => {
    const newField: FormField = {
      id: uuidv4(),
      label: `Question ${fields.length + 1}`,
      type: 'text',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const addOption = (fieldId: string) => {
    if (!optionInput.trim()) return;

    setFields(fields.map(field => {
      if (field.id === fieldId) {
        const options = field.options || [];
        return { ...field, options: [...options, optionInput.trim()] };
      }
      return field;
    }));

    setOptionInput('');
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFields(fields.map(field => {
      if (field.id === fieldId && field.options) {
        return { 
          ...field, 
          options: field.options.filter((_, index) => index !== optionIndex) 
        };
      }
      return field;
    }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFields(items);
  };

  const renderOptionEditor = (field: FormField) => {
    if (!['select', 'checkbox', 'radio'].includes(field.type) || editingOptions !== field.id) {
      return null;
    }

    return (
      <div className="mt-4 p-4 bg-muted/50 rounded-md border border-border animate-fade-in">
        <h4 className="font-medium mb-2">Options</h4>
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <div key={index} className="flex items-center">
              <div className="w-6 text-sm text-muted-foreground">{index + 1}.</div>
              <div className="flex-grow">{option}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOption(field.id, index)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            value={optionInput}
            onChange={e => setOptionInput(e.target.value)}
            placeholder="Add option"
            className="flex-grow"
          />
          <Button
            onClick={() => addOption(field.id)}
            size="sm"
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="form-fields">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="animate-fade-in"
                    >
                      <Card>
                        <CardHeader className="pb-2 flex flex-row items-center">
                          <div
                            {...provided.dragHandleProps}
                            className="mr-2 cursor-grab active:cursor-grabbing p-1"
                          >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <CardTitle className="text-lg font-medium grow">
                            <Input
                              value={field.label}
                              onChange={e => updateField(field.id, { label: e.target.value })}
                              className="font-medium"
                              placeholder="Question title"
                            />
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {['select', 'checkbox', 'radio'].includes(field.type) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingOptions(editingOptions === field.id ? null : field.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeField(field.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`field-type-${field.id}`}>Field Type</Label>
                              <Select
                                value={field.type}
                                onValueChange={(value: FieldType) => updateField(field.id, { type: value })}
                              >
                                <SelectTrigger id={`field-type-${field.id}`}>
                                  <SelectValue placeholder="Select field type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fieldTypeOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-end space-x-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`required-${field.id}`}
                                  checked={field.required}
                                  onCheckedChange={(checked) => 
                                    updateField(field.id, { required: checked === true })
                                  }
                                />
                                <label
                                  htmlFor={`required-${field.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Required field
                                </label>
                              </div>
                            </div>
                          </div>
                          {renderOptionEditor(field)}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-between">
        <Button
          onClick={addField}
          variant="outline"
          className="button-hover"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
        
        <Button
          onClick={() => onSave(fields)}
          className="button-hover"
        >
          Save Form
        </Button>
      </div>
    </div>
  );
};

export default FormBuilder;
