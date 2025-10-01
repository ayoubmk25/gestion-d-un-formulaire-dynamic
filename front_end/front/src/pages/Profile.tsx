import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Building,
  Calendar,
  Save,
  KeyRound,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useApi } from '@/hooks/useApi'; // Import useApi
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const api = useApi(); // Get API methods
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const formatJoinDate = () => {
    try {
      if (user?.createdAt) {
        return new Date(user.createdAt).toLocaleDateString();
      }
      return 'N/A';
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error); // Translated error message
      return 'N/A';
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Simulate API call to update profile (keep comment)
      setTimeout(() => {
        console.log('Mise à jour des données du profil:', formData); // Translated log
        
        toast({
          title: "Profil mis à jour", // Translated
          description: "Vos informations de profil ont été mises à jour", // Translated
          variant: "default",
        });
        
        setIsUpdating(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Erreur lors de la mise à jour du profil", // Translated
        description: "Un problème est survenu lors de la mise à jour de votre profil", // Translated
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Les mots de passe ne correspondent pas", // Translated
        description: "Le nouveau mot de passe et la confirmation doivent correspondre", // Translated
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      let response;
      if (user?.role === 'administrator') { // Use 'administrator' role
        response = await api.changeAdminPassword({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          new_password_confirmation: passwordData.confirmPassword,
        });
      } else if (user?.role === 'technician' || user?.role === 'validator') { // Use 'technician' and 'validator' roles
        response = await api.changeCollaboratorPassword({
          old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        
        });
      } else {
        throw new Error("Rôle utilisateur non pris en charge pour le changement de mot de passe."); // Translated error
      }

      if (response.status === 200) {
        toast({
          title: "Mot de passe mis à jour", // Translated
          description: "Votre mot de passe a été changé avec succès", // Translated
          variant: "default",
        });

        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        navigate('/dashboard'); // Redirect to login after password change
      } else {
        // Handle potential API errors with specific messages (keep comment)
        toast({
          title: "Erreur lors de la mise à jour du mot de passe", // Translated
          description: response.data?.message || "Un problème est survenu lors de la mise à jour de votre mot de passe", // Translated
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error); // Translated log
      toast({
        title: "Erreur lors de la mise à jour du mot de passe", // Translated
        description: error.response?.data?.message || "Un problème est survenu lors de la mise à jour de votre mot de passe", // Translated
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Votre Profil</h1> {/* Translated */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle> {/* Translated */}
                <CardDescription>
                  Mettez à jour vos informations personnelles {/* Translated */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label> {/* Translated */}
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label> {/* Translated */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="pl-10"
                        disabled
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      L'adresse e-mail ne peut pas être modifiée {/* Translated */}
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                   
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle> {/* Translated */}
                <CardDescription>
                  Mettez à jour le mot de passe de votre compte {/* Translated */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label> {/* Translated */}
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="pl-10"
                        disabled={user?.role === 'root'}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label> {/* Translated */}
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="pl-10"
                        disabled={user?.role === 'root'}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label> {/* Translated */}
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="pl-10"
                        disabled={user?.role === 'root'}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdating || user?.role === 'root'}>
                      {isUpdating ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Mise à jour... {/* Translated */}
                        </>
                      ) : (
                        'Changer le mot de passe' // Translated
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Détails du compte</CardTitle> {/* Translated */}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="text-2xl">{getInitials(user?.name || '')}</AvatarFallback>
                    </Avatar>
                    
                    <h3 className="text-xl font-medium">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    
                    <Badge className="mt-2 capitalize bg-primary/10 text-primary hover:bg-primary/20">
                      {user?.role}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user?.company || 'Société inconnue'}</span> {/* Translated */}
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="capitalize">Compte {user?.role}</span> {/* Translated (with variable) */}
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Inscrit le {formatJoinDate()}</span> {/* Translated */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
