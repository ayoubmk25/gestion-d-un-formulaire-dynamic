import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Save,
  User,
  Mail,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schema with translated messages
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit comporter au moins 2 caractères.", // Translated
  }),
  email: z.string().email({
    message: "Veuillez saisir une adresse e-mail valide.", // Translated
  }),
  role: z.enum(['technician', 'validator'], {
    required_error: "Veuillez sélectionner un rôle.", // Translated
  }),
});

const EditCollaborator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get API methods from the hook
  const { getCollaborator, updateCollaborator } = useApi();

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: undefined,
    },
  });

  useEffect(() => {
    // Load collaborator details from the API
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await getCollaborator(id);
        const collaboratorData = response.data;
        
        // Set form values
        form.reset({
          name: collaboratorData.name,
          email: collaboratorData.email,
          role: collaboratorData.role,
        });
      } catch (error) {
        console.error('Error loading collaborator details:', error);
        toast({
          title: "Erreur lors du chargement des détails du collaborateur", // Translated
          description: "Un problème est survenu lors du chargement des informations du collaborateur.", // Translated
          variant: "destructive",
        });
        navigate('/collaborators');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getCollaborator, id, navigate, form]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await updateCollaborator(id, data);
      toast({
        title: "Collaborateur mis à jour", // Translated
        description: "Les informations du collaborateur ont été mises à jour avec succès.", // Translated
      });
      navigate(`/collaborators/${id}`);
    } catch (error) {
      console.error('Error updating collaborator:', error);
      toast({
        title: "Erreur lors de la mise à jour du collaborateur", // Translated
        description: "Un problème est survenu lors de la mise à jour des informations du collaborateur.", // Translated
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
          {/* Skeleton Loader - No visible text */}
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-[500px] bg-muted rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex items-center mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate(`/collaborators/${id}`)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour {/* Translated */}
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Modifier le collaborateur</h1> {/* Translated */}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Informations du collaborateur</CardTitle> {/* Translated */}
            <CardDescription>Mettre à jour les détails du collaborateur</CardDescription> {/* Translated */}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel> {/* Translated */}
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Saisir le nom complet" className="pl-9" {...field} /> {/* Translated placeholder */}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel> {/* Translated */}
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="email@example.com" className="pl-9" {...field} /> {/* Kept placeholder format */}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rôle</FormLabel> {/* Translated */}
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <div className="relative">
                              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <SelectTrigger className="pl-9">
                                <SelectValue placeholder="Sélectionner un rôle" /> {/* Translated */}
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technician">Technicien</SelectItem> {/* Translated */}
                            <SelectItem value="validator">Validateur</SelectItem> {/* Translated */}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/collaborators/${id}`)}
                  >
                    Annuler {/* Translated */}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Enregistrement... {/* Translated */}
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer les modifications {/* Translated */}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditCollaborator;