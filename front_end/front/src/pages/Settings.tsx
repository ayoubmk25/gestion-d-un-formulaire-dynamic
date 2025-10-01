import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import {
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Mail, 
  Moon, 
  Sun, 
  Monitor, 
  Save, 
  Languages, 
  Palette,
  Check
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation(); // Use the hook
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'system',
    language: i18n.language, // Initialize with current language
    notifications: {
      email: true,
      formAssignments: true,
      formValidations: true,
      systemUpdates: false,
    }
  });

  const handleThemeChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      theme: value,
    }));
    
    toast({
      title: "Theme updated",
      description: `Theme preference set to ${value}`,
      variant: "default",
    });
  };

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value); // Change language using i18n
    setSettings(prev => ({
      ...prev,
      language: value,
    }));

    toast({
      title: "Language updated",
      description: `Language preference set to ${
        value === 'en' ? 'English' : value === 'fr' ? 'French' : 'Español'
      }`,
      variant: "default",
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      }
    }));
  };

  const saveNotificationSettings = () => {
    setIsUpdating(true);
    
    // Simulate API call to save notification settings
    setTimeout(() => {
      console.log('Saving notification settings:', settings.notifications);
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated",
        variant: "default",
      });
      
      setIsUpdating(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{t('settings.title')}</h1>
        
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              {t('settings.tabs.notifications')}
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              {t('settings.tabs.appearance')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications.title')}</CardTitle>
                <CardDescription>
                  {t('settings.notifications.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">{t('settings.notifications.email.label')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.notifications.email.description')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">{t('settings.notifications.types.title')}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.notifications.types.form_assignments.label')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.types.form_assignments.description')}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.formAssignments}
                      onCheckedChange={(checked) => handleNotificationChange('formAssignments', checked)}
                      disabled={!settings.notifications.email}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.notifications.types.form_validations.label')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.types.form_validations.description')}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.formValidations}
                      onCheckedChange={(checked) => handleNotificationChange('formValidations', checked)}
                      disabled={!settings.notifications.email}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.notifications.types.system_updates.label')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.types.system_updates.description')}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.systemUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('systemUpdates', checked)}
                      disabled={!settings.notifications.email}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={saveNotificationSettings} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {t('settings.notifications.save_button.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('settings.notifications.save_button.save')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.appearance.title')}</CardTitle>
                <CardDescription>
                  {t('settings.appearance.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">{t('settings.appearance.theme.label')}</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={handleThemeChange}
                  >
                    <SelectTrigger id="theme" className="w-full md:w-[200px]">
                      <SelectValue placeholder={t('settings.appearance.theme.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-2" />
                          {t('settings.appearance.theme.light')}
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2" />
                          {t('settings.appearance.theme.dark')}
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center">
                          <Monitor className="h-4 w-4 mr-2" />
                          {t('settings.appearance.theme.system')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="language">{t('settings.appearance.language.label')}</Label> {/* Use translation */}
                  <Select
                    value={i18n.language} // Use i18n.language for the selected value
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger id="language" className="w-full md:w-[200px]">
                      <SelectValue placeholder={t('settings.appearance.language.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center">
                          <Languages className="h-4 w-4 mr-2" />
                          {t('settings.appearance.language.english')}
                        </div>
                      </SelectItem>
                      <SelectItem value="fr">
                        <div className="flex items-center">
                          <Languages className="h-4 w-4 mr-2" />
                          {t('settings.appearance.language.french')}
                        </div>
                      </SelectItem>
                      <SelectItem value="es">
                        <div className="flex items-center">
                          <Languages className="h-4 w-4 mr-2" />
                          {t('settings.appearance.language.spanish')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
