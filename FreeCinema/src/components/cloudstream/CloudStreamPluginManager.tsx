
import { useState, useEffect } from 'react';
import { PlusCircle, FileCode, Github, Download, CloudOff, RefreshCw, Trash2, Clock, CheckCircle, Tag, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { INDIAN_LANGUAGES, addPlugin, addRepository, syncContent } from '@/services/cloudstream';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CloudStreamPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  repository: string;
  language?: string;
  categories?: string[];
  lastUpdated: string;
  status: 'installed' | 'available' | 'update-available';
}

interface CloudStreamRepository {
  id: string;
  name: string;
  url: string;
  description?: string;
  author?: string;
  pluginCount: number;
  isEnabled: boolean;
  lastSynced?: string;
}

const CloudStreamPluginManager = () => {
  const [activeTab, setActiveTab] = useState('plugins');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingRepo, setIsAddingRepo] = useState(false);
  const [newRepo, setNewRepo] = useState({ name: '', url: '', description: '', author: '' });
  const [isImportingPlugin, setIsImportingPlugin] = useState(false);
  const [pluginUrl, setPluginUrl] = useState('');
  const [newPlugin, setNewPlugin] = useState({ 
    name: '', 
    url: '', 
    version: '1.0.0', 
    description: '', 
    author: '', 
    repository: '', 
    categories: [] as string[],
    language: 'hi'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch plugins
  const { data: plugins = [] } = useQuery({
    queryKey: ['cloudstream-plugins'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('cloudstream_plugins')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        // Convert to the expected format
        return (data || []).map((plugin: any) => ({
          id: plugin.id,
          name: plugin.name,
          description: plugin.description || `Plugin for ${plugin.name}`,
          version: plugin.version || '1.0.0',
          author: plugin.author || 'Unknown',
          repository: plugin.repository || 'Custom',
          language: plugin.language,
          categories: plugin.categories || [],
          lastUpdated: plugin.installed_at || new Date().toISOString(),
          status: plugin.is_installed ? 'installed' : 'available'
        })) as CloudStreamPlugin[];
      } catch (error) {
        console.error('Error fetching plugins:', error);
        return [];
      }
    }
  });

  // Fetch repositories
  const { data: repositories = [] } = useQuery({
    queryKey: ['cloudstream-repositories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('cloudstream_repositories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        // Convert to the expected format
        return (data || []).map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          url: repo.url,
          description: repo.description || `Repository for ${repo.name}`,
          author: repo.author || 'Unknown',
          pluginCount: 0, // This would need to be calculated
          isEnabled: repo.is_enabled,
          lastSynced: repo.last_synced
        })) as CloudStreamRepository[];
      } catch (error) {
        console.error('Error fetching repositories:', error);
        return [];
      }
    }
  });

  // Mutation for toggling repository enabled status
  const toggleRepoMutation = useMutation({
    mutationFn: async (repo: CloudStreamRepository) => {
      const { error } = await supabase
        .from('cloudstream_repositories')
        .update({ is_enabled: !repo.isEnabled })
        .eq('id', repo.id);
      
      if (error) throw error;
      return { ...repo, isEnabled: !repo.isEnabled };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudstream-repositories'] });
      toast({
        title: "Repository Updated",
        description: "Repository status has been updated",
      });
    }
  });

  // Mutation for installing/uninstalling plugins
  const updatePluginMutation = useMutation({
    mutationFn: async ({ id, install }: { id: string; install: boolean }) => {
      const { error } = await supabase
        .from('cloudstream_plugins')
        .update({ is_installed: install })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudstream-plugins'] });
      toast({
        title: "Plugin Updated",
        description: "Plugin status has been updated",
      });
    }
  });

  // Mutation for adding a new plugin
  const addPluginMutation = useMutation({
    mutationFn: async (plugin: typeof newPlugin) => {
      const success = await addPlugin(plugin);
      if (!success) throw new Error("Failed to add plugin");
      return plugin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudstream-plugins'] });
      setIsImportingPlugin(false);
      setPluginUrl('');
      setNewPlugin({ 
        name: '', 
        url: '', 
        version: '1.0.0', 
        description: '', 
        author: '', 
        repository: '', 
        categories: [],
        language: 'hi'
      });
      toast({
        title: "Plugin Added",
        description: "New plugin has been added successfully",
      });
    }
  });

  // Mutation for adding a new repository
  const addRepoMutation = useMutation({
    mutationFn: async (repo: typeof newRepo) => {
      const success = await addRepository(repo);
      if (!success) throw new Error("Failed to add repository");
      return repo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudstream-repositories'] });
      setIsAddingRepo(false);
      setNewRepo({ name: '', url: '', description: '', author: '' });
      toast({
        title: "Repository Added",
        description: "New repository has been added successfully",
      });
    }
  });

  // Mutation for syncing content
  const syncContentMutation = useMutation({
    mutationFn: async () => {
      const result = await syncContent();
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      toast({
        title: "Content Synced",
        description: result.message,
      });
    }
  });

  // Filter plugins by search query
  const filteredPlugins = plugins.filter(plugin => 
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter repositories by search query
  const filteredRepos = repositories.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (repo.author && repo.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle toggle repository enabled state
  const handleToggleRepo = (repo: CloudStreamRepository) => {
    toggleRepoMutation.mutate(repo);
  };

  // Handle install/uninstall plugin
  const handleUpdatePlugin = (id: string, install: boolean) => {
    updatePluginMutation.mutate({ id, install });
  };

  // Add new repository
  const handleAddRepository = () => {
    if (!newRepo.name || !newRepo.url) {
      toast({
        title: "Validation Error",
        description: "Please provide both name and URL for the repository",
        variant: "destructive"
      });
      return;
    }
    
    addRepoMutation.mutate(newRepo);
  };

  // Import plugin from URL
  const handleImportPlugin = () => {
    if (!newPlugin.name || !newPlugin.url) {
      toast({
        title: "Validation Error",
        description: "Please provide both name and URL for the plugin",
        variant: "destructive"
      });
      return;
    }
    
    addPluginMutation.mutate(newPlugin);
  };

  // Handle simple plugin import from URL
  const handleSimplePluginImport = () => {
    if (!pluginUrl) {
      toast({
        title: "Validation Error",
        description: "Please provide a valid plugin URL",
        variant: "destructive"
      });
      return;
    }
    
    // Extract name from URL
    const urlParts = pluginUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('.')[0];
    const name = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    
    const plugin = {
      name,
      url: pluginUrl,
      version: '1.0.0',
      description: `Plugin for ${name}`,
      author: 'Unknown',
      repository: 'Custom Import',
      categories: ['indian'],
      language: 'hi'
    };
    
    addPluginMutation.mutate(plugin);
  };

  // Sync all repositories
  const handleSyncAll = () => {
    syncContentMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">CloudStream Plugin Manager</h2>
          <p className="text-gray-400">Manage extensions and repositories for CloudStream with focus on Indian content</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog open={isImportingPlugin} onOpenChange={setIsImportingPlugin}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileCode className="h-4 w-4" />
                Import Plugin
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-moviemate-card/90 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle>Import Plugin</DialogTitle>
                <DialogDescription>
                  Import a CloudStream plugin with details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plugin-name">Plugin Name</Label>
                    <Input
                      id="plugin-name"
                      placeholder="Hotstar"
                      value={newPlugin.name}
                      onChange={(e) => setNewPlugin({...newPlugin, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plugin-version">Version</Label>
                    <Input
                      id="plugin-version"
                      placeholder="1.0.0"
                      value={newPlugin.version}
                      onChange={(e) => setNewPlugin({...newPlugin, version: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plugin-url">Plugin URL</Label>
                  <Input
                    id="plugin-url"
                    placeholder="https://github.com/user/repo/plugin.zip"
                    value={newPlugin.url}
                    onChange={(e) => setNewPlugin({...newPlugin, url: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plugin-description">Description</Label>
                  <Input
                    id="plugin-description"
                    placeholder="Indian streaming service"
                    value={newPlugin.description}
                    onChange={(e) => setNewPlugin({...newPlugin, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plugin-author">Author</Label>
                    <Input
                      id="plugin-author"
                      placeholder="Developer name"
                      value={newPlugin.author}
                      onChange={(e) => setNewPlugin({...newPlugin, author: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plugin-repo">Repository</Label>
                    <Input
                      id="plugin-repo"
                      placeholder="Repository name"
                      value={newPlugin.repository}
                      onChange={(e) => setNewPlugin({...newPlugin, repository: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plugin-categories">Categories (comma-separated)</Label>
                  <Input
                    id="plugin-categories"
                    placeholder="indian, movies, series"
                    value={newPlugin.categories.join(', ')}
                    onChange={(e) => setNewPlugin({
                      ...newPlugin, 
                      categories: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plugin-language">Language</Label>
                  <select
                    id="plugin-language"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newPlugin.language}
                    onChange={(e) => setNewPlugin({...newPlugin, language: e.target.value})}
                  >
                    {INDIAN_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <Label>Quick Import</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste plugin URL directly"
                      value={pluginUrl}
                      onChange={(e) => setPluginUrl(e.target.value)}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleSimplePluginImport}
                      disabled={!pluginUrl}
                    >
                      Import
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Just paste a plugin URL for quick import with auto-generated details.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportingPlugin(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleImportPlugin}
                  disabled={!newPlugin.name || !newPlugin.url}
                >
                  Add Plugin
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddingRepo} onOpenChange={setIsAddingRepo}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Github className="h-4 w-4" />
                Add Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-moviemate-card/90 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle>Add Repository</DialogTitle>
                <DialogDescription>
                  Add a new CloudStream repository to find more Indian content plugins
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="repo-name">Repository Name</Label>
                  <Input
                    id="repo-name"
                    placeholder="Indian Plugins"
                    value={newRepo.name}
                    onChange={(e) => setNewRepo({...newRepo, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/user/cloudstream-extensions"
                    value={newRepo.url}
                    onChange={(e) => setNewRepo({...newRepo, url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo-description">Description (Optional)</Label>
                  <Input
                    id="repo-description"
                    placeholder="Collection of Indian streaming service plugins"
                    value={newRepo.description}
                    onChange={(e) => setNewRepo({...newRepo, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo-author">Author (Optional)</Label>
                  <Input
                    id="repo-author"
                    placeholder="Repository maintainer"
                    value={newRepo.author}
                    onChange={(e) => setNewRepo({...newRepo, author: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingRepo(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddRepository}
                  disabled={!newRepo.name || !newRepo.url}
                >
                  Add Repository
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={handleSyncAll} 
            className="gap-2"
            disabled={syncContentMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${syncContentMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Content
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Input
          placeholder="Search plugins or repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-moviemate-card/50"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plugins" className="mt-6">
          {filteredPlugins.length === 0 ? (
            <Card className="bg-moviemate-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>No Plugins Found</CardTitle>
                <CardDescription>
                  Try adding repositories or importing plugins directly
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setIsImportingPlugin(true)}>
                  <FileCode className="mr-2 h-4 w-4" />
                  Import Plugin
                </Button>
                <Button variant="outline" onClick={() => setIsAddingRepo(true)}>
                  <Github className="mr-2 h-4 w-4" />
                  Add Repository
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlugins.map(plugin => (
                <Card key={plugin.id} className="bg-moviemate-card/50 backdrop-blur-sm overflow-hidden">
                  <div className={`h-1 w-full ${
                    plugin.status === 'installed' 
                      ? 'bg-green-500' 
                      : plugin.status === 'update-available' 
                        ? 'bg-amber-500' 
                        : 'bg-gray-500'
                  }`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plugin.name}
                          {plugin.status === 'update-available' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500">
                              Update
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {plugin.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                      <div>Version: {plugin.version}</div>
                      <div>Author: {plugin.author}</div>
                      <div>Repository: {plugin.repository}</div>
                      <div>Updated: {new Date(plugin.lastUpdated).toLocaleDateString()}</div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plugin.language && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {INDIAN_LANGUAGES.find(l => l.code === plugin.language)?.name || plugin.language}
                        </Badge>
                      )}
                      
                      {plugin.categories && plugin.categories.length > 0 && plugin.categories.map(category => (
                        <Badge 
                          key={category} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Tag className="h-3 w-3" />
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {plugin.status === 'installed' ? (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => handleUpdatePlugin(plugin.id, false)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Uninstall
                      </Button>
                    ) : plugin.status === 'update-available' ? (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => handleUpdatePlugin(plugin.id, true)}
                      >
                        <Download className="h-4 w-4" />
                        Update
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full gap-2" 
                        onClick={() => handleUpdatePlugin(plugin.id, true)}
                      >
                        <Download className="h-4 w-4" />
                        Install
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="repositories" className="mt-6">
          {filteredRepos.length === 0 ? (
            <Card className="bg-moviemate-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>No Repositories Found</CardTitle>
                <CardDescription>
                  Add a new repository to find Indian content plugins
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button onClick={() => setIsAddingRepo(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Repository
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRepos.map(repo => (
                <Card key={repo.id} className="bg-moviemate-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {repo.name}
                          {!repo.isEnabled && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                              Disabled
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {repo.description || 'No description available'}
                        </CardDescription>
                      </div>
                      <Switch
                        checked={repo.isEnabled}
                        onCheckedChange={() => handleToggleRepo(repo)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>URL: {repo.url}</div>
                      {repo.author && <div>Author: {repo.author}</div>}
                      <div>Plugins: {repo.pluginCount || 0}</div>
                      {repo.lastSynced && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last synced: {new Date(repo.lastSynced).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleRepo(repo)}
                    >
                      {repo.isEnabled ? (
                        <>
                          <CloudOff className="mr-2 h-4 w-4" />
                          Disable
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Enable
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => syncContentMutation.mutate()}
                      disabled={syncContentMutation.isPending}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${syncContentMutation.isPending ? 'animate-spin' : ''}`} />
                      Sync
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CloudStreamPluginManager;
