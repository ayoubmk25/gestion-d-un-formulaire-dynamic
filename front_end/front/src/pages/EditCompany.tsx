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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  ArrowLeft,
  Building,
  Save
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  max_users: z.coerce.number().int().min(1, {
    message: "Must allow at least 1 user.",
  }),
  forms_to_create: z.coerce.number().int().min(1, {
    message: "Must allow at least 1 form.",
  }),
});

const EditCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get API methods from the hook
  const { getCompany, updateCompany } = useApi();

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      max_users: 5,
      forms_to_create: 10,
    },
  });

  useEffect(() => {
    // Load company details from the API
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await getCompany(id);
        const companyData = response.data;
        
        // Set form values
        form.reset({
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone || "",
          max_users: companyData.max_users,
          forms_to_create: companyData.forms_to_create,
        });
      } catch (error) {
        console.error('Error loading company details:', error);
        toast({
          title: "Error loading company details",
          description: "There was a problem loading the company information.",
          variant: "destructive",
        });
        navigate('/companies');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getCompany, id, navigate, form]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await updateCompany(id, data);
      toast({
        title: "Company updated",
        description: "The company information has been updated successfully.",
      });
      navigate(`/companies/${id}`);
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Error updating company",
        description: "There was a problem updating the company information.",
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
          <Button variant="outline" size="sm" onClick={() => navigate(`/companies/${id}`)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
Modifier la société</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
Informations sur l'entreprise</CardTitle>
            <CardDescription>
Mettre à jour les détails de l'entreprise et l'allocation des ressources</CardDescription>
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
                        <FormLabel>Nom de l'entreprise</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="company@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>telephone (Optionelle)</FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Allocation des ressources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="max_users"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
Nombre maximum d'utilisateurs</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            
Nombre maximum d'utilisateurs autorisés pour cette entreprise
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="forms_to_create"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
Attribution des formulaires</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormDescription>
                          
Nombre de formulaires que cette entreprise peut créer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/companies/${id}`)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                       enregistrée
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                       Enregistrer les modifications
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

export default EditCompany;