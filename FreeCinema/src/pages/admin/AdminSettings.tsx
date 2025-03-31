
import { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Undo2, Wand2 } from 'lucide-react';

const AdminSettings = () => {
  const { settings, updateSettings } = useAdmin();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ ...settings });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast({
      title: 'Settings Updated',
      description: 'Your changes have been saved successfully.',
    });
  };
  
  const resetChanges = () => {
    setFormData({ ...settings });
    toast({
      title: 'Changes Reset',
      description: 'All changes have been reverted.',
    });
  };
  
  const applyRandomTheme = () => {
    // Generate a random color in the purple/blue spectrum
    const hue = Math.floor(Math.random() * 60) + 240; // 240-300 is purple/blue range
    const saturation = Math.floor(Math.random() * 30) + 70; // 70-100% saturation
    const lightness = Math.floor(Math.random() * 20) + 50; // 50-70% lightness
    
    const primaryColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const secondaryColor = `hsl(${hue - 10}, ${saturation - 10}%, ${lightness - 15}%)`;
    const accentColor = `hsl(${hue + 20}, ${saturation - 20}%, ${lightness - 20}%)`;
    
    setFormData(prev => ({
      ...prev,
      primaryColor,
      secondaryColor,
      accentColor
    }));
    
    toast({
      title: 'Theme Applied',
      description: 'A new random theme has been applied. Remember to save your changes!',
    });
  };

  const applyThemePreset = (preset: 'purple' | 'blue' | 'red' | 'green') => {
    let colors = {
      primaryColor: '',
      secondaryColor: '',
      accentColor: '',
      sidebarBackgroundColor: ''
    };

    switch (preset) {
      case 'purple':
        colors = {
          primaryColor: '#9b87f5',
          secondaryColor: '#7E69AB',
          accentColor: '#6E59A5',
          sidebarBackgroundColor: '#1a1f2c'
        };
        break;
      case 'blue':
        colors = {
          primaryColor: '#4B79F2',
          secondaryColor: '#365ABF',
          accentColor: '#1E3A8A',
          sidebarBackgroundColor: '#15202b'
        };
        break;
      case 'red':
        colors = {
          primaryColor: '#f56565',
          secondaryColor: '#c53030',
          accentColor: '#9b2c2c',
          sidebarBackgroundColor: '#1a202c'
        };
        break;
      case 'green':
        colors = {
          primaryColor: '#48bb78',
          secondaryColor: '#38a169',
          accentColor: '#2f855a',
          sidebarBackgroundColor: '#1a2521'
        };
        break;
    }

    setFormData(prev => ({
      ...prev,
      ...colors
    }));

    toast({
      title: `${preset.charAt(0).toUpperCase() + preset.slice(1)} Theme Applied`,
      description: 'Theme preset has been applied. Remember to save your changes!',
    });
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Site Settings</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={resetChanges}>
              <Undo2 className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={applyRandomTheme} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Wand2 className="mr-2 h-4 w-4" />
              Random Theme
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="theme">Theme Presets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">General Settings</CardTitle>
                  <CardDescription>
                    Configure the basic information for your FreeCinema site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={formData.siteName}
                      onChange={handleChange}
                      placeholder="FreeCinema"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      name="siteDescription"
                      value={formData.siteDescription}
                      onChange={handleChange}
                      placeholder="Watch movies and TV shows online for free"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                    />
                    {formData.logoUrl && (
                      <div className="mt-2 rounded bg-moviemate-background p-2">
                        <img 
                          src={formData.logoUrl} 
                          alt="Logo preview" 
                          className="mx-auto h-20 object-contain" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tmdbApiKey">TMDB API Key</Label>
                    <Input
                      id="tmdbApiKey"
                      name="tmdbApiKey"
                      value={formData.tmdbApiKey}
                      onChange={handleChange}
                      placeholder="Your TMDB API Key"
                    />
                    <p className="text-xs text-gray-500">
                      Default key is provided but you can use your own for better performance
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of your FreeCinema site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-4">
                      <div 
                        className="h-10 w-10 rounded" 
                        style={{ backgroundColor: formData.primaryColor }}
                      ></div>
                      <Input
                        id="primaryColor"
                        name="primaryColor"
                        value={formData.primaryColor}
                        onChange={handleChange}
                        placeholder="#9b87f5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-4">
                      <div 
                        className="h-10 w-10 rounded" 
                        style={{ backgroundColor: formData.secondaryColor }}
                      ></div>
                      <Input
                        id="secondaryColor"
                        name="secondaryColor"
                        value={formData.secondaryColor}
                        onChange={handleChange}
                        placeholder="#7E69AB"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-4">
                      <div 
                        className="h-10 w-10 rounded" 
                        style={{ backgroundColor: formData.accentColor }}
                      ></div>
                      <Input
                        id="accentColor"
                        name="accentColor"
                        value={formData.accentColor}
                        onChange={handleChange}
                        placeholder="#6E59A5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sidebarBackgroundColor">Sidebar Background</Label>
                    <div className="flex gap-4">
                      <div 
                        className="h-10 w-10 rounded" 
                        style={{ backgroundColor: formData.sidebarBackgroundColor }}
                      ></div>
                      <Input
                        id="sidebarBackgroundColor"
                        name="sidebarBackgroundColor"
                        value={formData.sidebarBackgroundColor}
                        onChange={handleChange}
                        placeholder="#1a1f2c"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customCSS">Custom CSS</Label>
                    <Textarea
                      id="customCSS"
                      name="customCSS"
                      value={formData.customCSS}
                      onChange={handleChange}
                      placeholder=".custom-class { color: white; }"
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Add custom CSS to further customize your site's appearance
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="features">
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Feature Settings</CardTitle>
                  <CardDescription>
                    Enable or disable features for your FreeCinema site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableLiveTV" className="text-base">Live TV</Label>
                      <p className="text-sm text-gray-500">Enable the Live TV section on your site</p>
                    </div>
                    <Switch
                      id="enableLiveTV"
                      checked={formData.enableLiveTV}
                      onCheckedChange={(checked) => handleSwitchChange('enableLiveTV', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableCloudStream" className="text-base">CloudStream Content</Label>
                      <p className="text-sm text-gray-500">Enable CloudStream content from CSX and Phisher extensions</p>
                    </div>
                    <Switch
                      id="enableCloudStream"
                      checked={formData.enableCloudStream}
                      onCheckedChange={(checked) => handleSwitchChange('enableCloudStream', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableAutoPlay" className="text-base">Auto Play</Label>
                      <p className="text-sm text-gray-500">Automatically play content after a countdown</p>
                    </div>
                    <Switch
                      id="enableAutoPlay"
                      checked={formData.enableAutoPlay}
                      onCheckedChange={(checked) => handleSwitchChange('enableAutoPlay', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable3DEffects" className="text-base">3D Effects</Label>
                      <p className="text-sm text-gray-500">Enable 3D effects and animations across the site</p>
                    </div>
                    <Switch
                      id="enable3DEffects"
                      checked={formData.enable3DEffects}
                      onCheckedChange={(checked) => handleSwitchChange('enable3DEffects', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme">
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Theme Presets</CardTitle>
                  <CardDescription>
                    Choose from predefined theme presets for your site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <div 
                      className="cursor-pointer overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-white"
                      onClick={() => applyThemePreset('purple')}
                    >
                      <div className="h-24 bg-gradient-to-br from-[#9b87f5] to-[#6E59A5]"></div>
                      <div className="bg-[#1a1f2c] p-3 text-center">
                        <span className="font-medium">Purple</span>
                      </div>
                    </div>

                    <div 
                      className="cursor-pointer overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-white"
                      onClick={() => applyThemePreset('blue')}
                    >
                      <div className="h-24 bg-gradient-to-br from-[#4B79F2] to-[#1E3A8A]"></div>
                      <div className="bg-[#15202b] p-3 text-center">
                        <span className="font-medium">Blue</span>
                      </div>
                    </div>

                    <div 
                      className="cursor-pointer overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-white"
                      onClick={() => applyThemePreset('red')}
                    >
                      <div className="h-24 bg-gradient-to-br from-[#f56565] to-[#9b2c2c]"></div>
                      <div className="bg-[#1a202c] p-3 text-center">
                        <span className="font-medium">Red</span>
                      </div>
                    </div>

                    <div 
                      className="cursor-pointer overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-white"
                      onClick={() => applyThemePreset('green')}
                    >
                      <div className="h-24 bg-gradient-to-br from-[#48bb78] to-[#2f855a]"></div>
                      <div className="bg-[#1a2521] p-3 text-center">
                        <span className="font-medium">Green</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              className="bg-moviemate-primary hover:bg-moviemate-primary/90"
              size="lg"
            >
              <Save className="mr-2 h-5 w-5" />
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
