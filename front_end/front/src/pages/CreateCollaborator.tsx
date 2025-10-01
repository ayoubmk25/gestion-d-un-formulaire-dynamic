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
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, User, Save, Shield } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

// Schema with translated error messages
const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'), // Translated
  email: z.string().email('Veuillez saisir une adresse e-mail valide'), // Translated
  role: z.enum(['technician', 'validator'], {
    required_error: 'Veuillez sélectionner un rôle', // Translated
  }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateCollaborator = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createCollaborator } = useApi();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Call the API to create a collaborator
      await createCollaborator(data);
      
      toast({
        title: "Collaborateur créé", // Translated
        description: "Un e-mail d'invitation a été envoyé au collaborateur", // Translated
        variant: "default",
      });
      
      navigate('/collaborators');
    } catch (error) {
      console.error('Error creating collaborator:', error);
      toast({
        title: "Erreur lors de la création du collaborateur", // Translated
        description: "Un problème est survenu lors de la création du compte collaborateur", // Translated
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
          <Button variant="ghost" onClick={() => navigate('/collaborators')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux collaborateurs {/* Translated */}
          </Button>
          
          <h1 className="text-2xl font-bold">Ajouter un nouveau collaborateur</h1> {/* Translated */}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations du collaborateur</CardTitle> {/* Translated */}
                <CardDescription>
                  Saisissez les détails du nouveau collaborateur {/* Translated */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel> {/* Translated */}
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="Nom complet du collaborateur" // Translated
                                className="pl-10"
                              />
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
                          <FormLabel>Adresse e-mail</FormLabel> {/* Translated */}
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="Adresse e-mail du collaborateur" // Translated
                                type="email"
                                className="pl-10"
                              />
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
                          <FormControl>
                            <div className="relative">
                              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="pl-10">
                                  <SelectValue placeholder="Sélectionner un rôle" /> {/* Translated */}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="technician">Technicien</SelectItem> {/* Translated */}
                                  <SelectItem value="validator">Validateur</SelectItem> {/* Translated */}
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/collaborators')}
                      >
                        Annuler {/* Translated */}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Création en cours... {/* Translated */}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Créer le collaborateur {/* Translated */}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations sur les rôles</CardTitle> {/* Translated */}
                  <CardDescription>À propos des rôles de collaborateur</CardDescription> {/* Translated */}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Technicien</h3> {/* Translated */}
                    <p className="text-sm text-muted-foreground">
                      Les techniciens peuvent remplir des formulaires, consulter leur historique de formulaires et modifier les formulaires avec le statut "brouillon". {/* Translated */}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-1">Validateur</h3> {/* Translated */}
                    <p className="text-sm text-muted-foreground">
                      Les validateurs peuvent faire tout ce que les techniciens peuvent faire, et en plus, ils peuvent changer le statut d'un formulaire de "soumis" à "validé" et vice versa. {/* Translated */}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Que se passe-t-il ensuite ?</CardTitle> {/* Translated */}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Après la création d'un compte collaborateur, un e-mail d'invitation lui sera envoyé avec les instructions pour configurer son mot de passe et accéder au système. {/* Translated */}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCollaborator;