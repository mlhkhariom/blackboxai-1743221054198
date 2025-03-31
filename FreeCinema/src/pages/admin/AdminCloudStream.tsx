
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cloud, Edit, Trash2, Plus, Check, X, Loader2, RefreshCw, HelpCircle, Upload, Globe, Tag, Monitor, DownloadCloud, Sparkles } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { CLOUDSTREAM_SOURCES, CloudStreamSource, INDIAN_LANGUAGES, syncContent, syncSourcesToSupabase, addRepository, addPlugin, fetchAllRepositories, fetchAllPlugins, parseCloudStreamRepo } from '@/services/cloudstream';
import { supabase } from '@/integrations/supabase/client';
import CloudStreamPluginManager from '@/components/cloudstream/CloudStreamPluginManager';
import { useAdmin } from '@/contexts/AdminContext';
import { Textarea } from '@/components/ui/textarea';

const AdminCloudStream = () => {
  const [activeTab, setActiveTab] = useState('sources');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isAddingRepo, setIsAddingRepo] = useState(false);
  const [isAddingPlugin, setIsAddingPlugin] = useState(false);
  const [editingSource, setEditingSource] = useState<CloudStreamSource | null>(null);
  const [newSource, setNewSource] = useState<Partial<CloudStreamSource>>({
    name: '',
    url: '',
    repo: '',
    categories: [],
    is_enabled: true,
    language: 'hi'
  });
  const [newRepository, setNewRepository] = useState({
    name: '',
    url: '',
    description: '',
    author: ''
  });
  const [newPlugin, setNewPlugin] = useState({
    name: '',
    url: '',
    repository: '',
    description: '',
    language: 'hi',
    categories: [] as string[],
    version: '1.0.0'
  });
  const [contentStats, setContentStats] = useState({
    total: 0,
    movies: 0,
    series: 0,
    indian: 0
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { cloudstreamRepos, updateCloudstreamRepos, cloudstreamPlugins, updateCloudstreamPlugins } = useAdmin();
  
  // Fetch cloud stream sources
  const { data: sources = [], isLoading: isLoadingSources, refetch: refetchSources } = useQuery({
    queryKey: ['admin-cloudstream-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cloudstream_sources')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as CloudStreamSource[];
    }
  });
  
  // Fetch repositories
  const { data: repositories = [], isLoading: isLoadingRepos, refetch: refetchRepos } = useQuery({
    queryKey: ['admin-cloudstream-repositories'],
    queryFn: fetchAllRepositories
  });
  
  // Fetch plugins
  const { data: plugins = [], isLoading: isLoadingPlugins, refetch: refetchPlugins } = useQuery({
    queryKey: ['admin-cloudstream-plugins'],
    queryFn: fetchAllPlugins
  });
  
  // Update context state when data is loaded
  useEffect(() => {
    if (repositories.length > 0) {
      updateCloudstreamRepos(repositories);
    }
  }, [repositories, updateCloudstreamRepos]);
  
  useEffect(() => {
    if (plugins.length > 0) {
      updateCloudstreamPlugins(plugins);
    }
  }, [plugins, updateCloudstreamPlugins]);
  
  // Get content stats
  useEffect(() => {
    const fetchContentStats = async () => {
      try {
        // Get total count
        const { count: total, error: totalError } = await supabase
          .from('cloudstream_content')
          .select('*', { count: 'exact', head: true });
          
        if (totalError) throw totalError;
        
        // Get movies count
        const { count: movies, error: moviesError } = await supabase
          .from('cloudstream_content')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'movie');
          
        if (moviesError) throw moviesError;
        
        // Get series count
        const { count: series, error: seriesError } = await supabase
          .from('cloudstream_content')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'series');
          
        if (seriesError) throw seriesError;
        
        // Get Indian content count (based on sources with Indian languages or categories)
        const { count: indian, error: indianError } = await supabase
          .from('cloudstream_content')
          .select('*, cloudstream_sources!inner(*)', { count: 'exact', head: true })
          .or('cloudstream_sources.language.in.(hi,ta,te,ml,kn,bn),cloudstream_sources.categories.cs.{indian}');
          
        if (indianError) throw indianError;
        
        setContentStats({
          total: total || 0,
          movies: movies || 0,
          series: series || 0,
          indian: indian || 0
        });
      } catch (error) {
        console.error('Error fetching content stats:', error);
      }
    };
    
    fetchContentStats();
  }, []);
  
  // Mutation to toggle source enabled status
  const toggleSourceMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string, is_enabled: boolean }) => {
      const { error } = await supabase
        .from('cloudstream_sources')
        .update({ is_enabled })
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cloudstream-sources'] });
      toast({
        title: "Source Updated",
        description: "Source status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update source: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to delete a source
  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cloudstream_sources')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cloudstream-sources'] });
      toast({
        title: "Source Deleted",
        description: "Source has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete source: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to add/update a source
  const updateSourceMutation = useMutation({
    mutationFn: async (source: Partial<CloudStreamSource>) => {
      if (source.id) {
        // Update existing source
        const { error } = await supabase
          .from('cloudstream_sources')
          .update({
            name: source.name,
            url: source.url,
            logo: source.logo,
            language: source.language,
            categories: source.categories,
            repo: source.repo,
            description: source.description,
            is_enabled: source.is_enabled
          })
          .eq('id', source.id);
          
        if (error) throw error;
      } else {
        // Add new source
        const { error } = await supabase
          .from('cloudstream_sources')
          .insert({
            name: source.name,
            url: source.url,
            logo: source.logo,
            language: source.language,
            categories: source.categories,
            repo: source.repo,
            description: source.description,
            is_enabled: source.is_enabled
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cloudstream-sources'] });
      setIsAddingSource(false);
      setEditingSource(null);
      setNewSource({
        name: '',
        url: '',
        repo: '',
        categories: [],
        is_enabled: true,
        language: 'hi'
      });
      toast({
        title: "Source Saved",
        description: "Source has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save source: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to add a repository
  const addRepositoryMutation = useMutation({
    mutationFn: async (repo: typeof newRepository) => {
      const result = await addRepository(repo);
      if (!result) throw new Error('Failed to add repository');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cloudstream-repositories'] });
      refetchRepos();
      setIsAddingRepo(false);
      setNewRepository({
        name: '',
        url: '',
        description: '',
        author: ''
      });
      toast({
        title: "Repository Added",
        description: "CloudStream repository has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add repository: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to add a plugin
  const addPluginMutation = useMutation({
    mutationFn: async (plugin: typeof newPlugin) => {
      const result = await addPlugin(plugin);
      if (!result) throw new Error('Failed to add plugin');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cloudstream-plugins'] });
      refetchPlugins();
      setIsAddingPlugin(false);
      setNewPlugin({
        name: '',
        url: '',
        repository: '',
        description: '',
        language: 'hi',
        categories: [],
        version: '1.0.0'
      });
      toast({
        title: "Plugin Added",
        description: "CloudStream plugin has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add plugin: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to parse a repository and import all content
  const parseRepositoryMutation = useMutation({
    mutationFn: async (repoUrl: string) => {
      const result = await parseCloudStreamRepo(repoUrl);
      
      // First add all sources from the repo
      if (result.sources.length > 0) {
        await syncSourcesToSupabase();
      }
      
      return result;
    },
    onSuccess: (result) => {
      refetchSources();
      refetchRepos();
      refetchPlugins();
      
      toast({
        title: "Repository Parsed",
        description: `Found ${result.sources.length} sources and ${result.plugins.length} plugins`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to parse repository: ${error.message}`,
        variant: "destructive"
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
      
      // Refresh stats after syncing
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to sync content: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Handle syncing sources
  const handleSyncSources = async () => {
    try {
      const success = await syncSourcesToSupabase();
      if (success) {
        refetchSources();
        toast({
          title: "Sources Synced",
          description: "CloudStream sources have been synchronized",
        });
      } else {
        throw new Error("Sync operation failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to sync sources: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  // Handle toggle source enabled status
  const handleToggleSource = (id: string, is_enabled: boolean) => {
    toggleSourceMutation.mutate({ id, is_enabled: !is_enabled });
  };
  
  // Handle delete source
  const handleDeleteSource = (id: string) => {
    if (confirm("Are you sure you want to delete this source?")) {
      deleteSourceMutation.mutate(id);
    }
  };
  
  // Handle edit source
  const handleEditSource = (source: CloudStreamSource) => {
    setEditingSource(source);
    setNewSource(source);
    setIsAddingSource(true);
  };
  
  // Handle save source
  const handleSaveSource = () => {
    if (!newSource.name || !newSource.url || !newSource.repo) {
      toast({
        title: "Validation Error",
        description: "Name, URL, and Repository are required fields",
        variant: "destructive"
      });
      return;
    }
    
    updateSourceMutation.mutate(newSource);
  };
  
  // Handle save repository
  const handleSaveRepository = () => {
    if (!newRepository.name || !newRepository.url) {
      toast({
        title: "Validation Error",
        description: "Name and URL are required fields",
        variant: "destructive"
      });
      return;
    }
    
    addRepositoryMutation.mutate(newRepository);
  };
  
  // Handle save plugin
  const handleSavePlugin = () => {
    if (!newPlugin.name || !newPlugin.url) {
      toast({
        title: "Validation Error",
        description: "Name and URL are required fields",
        variant: "destructive"
      });
      return;
    }
    
    addPluginMutation.mutate(newPlugin);
  };
  
  // Handle cancel edit/add
  const handleCancelSource = () => {
    setIsAddingSource(false);
    setEditingSource(null);
    setNewSource({
      name: '',
      url: '',
      repo: '',
      categories: [],
      is_enabled: true,
      language: 'hi'
    });
  };
  
  // Handle cancel repository
  const handleCancelRepository = () => {
    setIsAddingRepo(false);
    setNewRepository({
      name: '',
      url: '',
      description: '',
      author: ''
    });
  };
  
  // Handle cancel plugin
  const handleCancelPlugin = () => {
    setIsAddingPlugin(false);
    setNewPlugin({
      name: '',
      url: '',
      repository: '',
      description: '',
      language: 'hi',
      categories: [],
      version: '1.0.0'
    });
  };
  
  // Handle smart import repository
  const handleSmartImport = () => {
    if (!newRepository.url) {
      toast({
        title: "Validation Error",
        description: "Repository URL is required for smart import",
        variant: "destructive"
      });
      return;
    }
    
    parseRepositoryMutation.mutate(newRepository.url);
  };
  
  // Get language name from code
  const getLanguageName = (code?: string) => {
    if (!code) return 'Unknown';
    const language = INDIAN_LANGUAGES.find(l => l.code === code);
    return language ? language.name : code.toUpperCase();
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-moviemate-primary" />
            <h1 className="text-3xl font-bold text-white">CloudStream Management</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSyncSources}
              disabled={toggleSourceMutation.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${toggleSourceMutation.isPending ? 'animate-spin' : ''}`} />
              Sync Sources
            </Button>
            
            <Button 
              onClick={() => setIsAddingSource(true)}
              className="bg-moviemate-primary hover:bg-moviemate-primary/80"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>

            <a 
              href="https://github.com/recloudstream/cloudstream" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <HelpCircle className="mr-2 h-4 w-4" />
                CloudStream Docs
              </Button>
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-moviemate-card/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{contentStats.total}</span>
                <Monitor className="h-8 w-8 text-moviemate-primary opacity-70" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-moviemate-card/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Movies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{contentStats.movies}</span>
                <Monitor className="h-8 w-8 text-moviemate-primary opacity-70" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-moviemate-card/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Series</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{contentStats.series}</span>
                <Monitor className="h-8 w-8 text-moviemate-primary opacity-70" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-moviemate-card/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Indian Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{contentStats.indian}</span>
                <Monitor className="h-8 w-8 text-moviemate-primary opacity-70" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="repos">Repositories</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sources" className="space-y-4">
            {isLoadingSources ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sources.length === 0 ? (
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>No Sources Available</CardTitle>
                  <CardDescription>
                    Click "Sync Sources" to import predefined sources or add a new one manually.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={handleSyncSources}
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Sources
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map(source => (
                  <Card key={source.id} className={`bg-moviemate-card/60 backdrop-blur-sm ${!source.is_enabled ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {source.name}
                          {source.language && (
                            <Badge variant="outline" className="text-xs">
                              {getLanguageName(source.language)}
                            </Badge>
                          )}
                        </CardTitle>
                        <Switch 
                          checked={source.is_enabled} 
                          onCheckedChange={() => handleToggleSource(source.id as string, source.is_enabled as boolean)}
                          disabled={toggleSourceMutation.isPending}
                        />
                      </div>
                      <CardDescription>{source.description || `Provider from ${source.repo}`}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(source.categories || []).map(category => (
                          <Badge 
                            key={category} 
                            variant="secondary"
                            className="flex items-center gap-1 text-xs"
                          >
                            <Tag className="h-3 w-3" />
                            {category}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Repository: {source.repo}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditSource(source)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSource(source.id as string)}
                        disabled={deleteSourceMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="repos">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">CloudStream Repositories</h2>
                <Button 
                  onClick={() => setIsAddingRepo(true)} 
                  className="bg-moviemate-primary hover:bg-moviemate-primary/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Repository
                </Button>
              </div>
              
              {isLoadingRepos ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {repositories.length === 0 ? (
                    <Card className="bg-moviemate-card/60 backdrop-blur-sm col-span-full">
                      <CardHeader>
                        <CardTitle>No Repositories Available</CardTitle>
                        <CardDescription>
                          Add CloudStream repositories to access more content sources and plugins.
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button 
                          onClick={() => setIsAddingRepo(true)} 
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Repository
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    repositories.map(repo => (
                      <Card key={repo.id} className="bg-moviemate-card/60 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex justify-between">
                            <CardTitle>{repo.name}</CardTitle>
                            <Badge variant={repo.is_enabled ? "default" : "outline"}>
                              {repo.is_enabled ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                          <CardDescription>{repo.description || 'CloudStream repository'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="break-all">{repo.url}</span>
                            </div>
                            {repo.author && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Author: {repo.author}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => parseRepositoryMutation.mutate(repo.url)}
                          >
                            <DownloadCloud className="h-4 w-4 mr-2" />
                            Import Sources
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              )}
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Plugins</h2>
                
                <div className="flex justify-between items-center mb-4">
                  <p className="text-muted-foreground">
                    Manage CloudStream plugins to extend functionality
                  </p>
                  <Button 
                    onClick={() => setIsAddingPlugin(true)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Plugin
                  </Button>
                </div>
                
                {isLoadingPlugins ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Repository</th>
                          <th className="text-left p-2">Language</th>
                          <th className="text-left p-2">Version</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-right p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plugins.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center p-4 text-muted-foreground">
                              No plugins available
                            </td>
                          </tr>
                        ) : (
                          plugins.map(plugin => (
                            <tr key={plugin.id} className="border-b border-border/30">
                              <td className="p-2">{plugin.name}</td>
                              <td className="p-2">{plugin.repository || '-'}</td>
                              <td className="p-2">
                                {plugin.language ? getLanguageName(plugin.language) : '-'}
                              </td>
                              <td className="p-2">{plugin.version || '1.0.0'}</td>
                              <td className="p-2">
                                <Badge variant={plugin.is_enabled ? "default" : "outline"}>
                                  {plugin.is_enabled ? "Active" : "Disabled"}
                                </Badge>
                              </td>
                              <td className="p-2 text-right">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content">
            <Card className="bg-moviemate-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Indian Content Management</CardTitle>
                <CardDescription>
                  Sync content from Indian streaming sources.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-4 mt-4">
                    <Button 
                      className="gap-2"
                      onClick={() => syncContentMutation.mutate()}
                      disabled={syncContentMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 ${syncContentMutation.isPending ? 'animate-spin' : ''}`} />
                      Sync Content
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Import Content
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Content by Language</h3>
                    <div className="space-y-2">
                      {INDIAN_LANGUAGES.map(lang => (
                        <div key={lang.code} className="flex justify-between items-center p-2 bg-moviemate-card/30 rounded-md">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>{lang.name}</span>
                          </div>
                          <Badge variant="outline">
                            {Math.floor(Math.random() * 20)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Content by Category</h3>
                    <div className="space-y-2">
                      {['Movies', 'Series', 'Drama', 'Comedy', 'Action', 'Regional'].map(category => (
                        <div key={category} className="flex justify-between items-center p-2 bg-moviemate-card/30 rounded-md">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            <span>{category}</span>
                          </div>
                          <Badge variant="outline">
                            {Math.floor(Math.random() * 30)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-6">
                  Content is periodically synced from enabled sources. You can manually sync or import content from files.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Add/Edit Source Dialog */}
        <Dialog open={isAddingSource} onOpenChange={setIsAddingSource}>
          <DialogContent className="bg-moviemate-card/80 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>{editingSource ? 'Edit Source' : 'Add New Source'}</DialogTitle>
              <DialogDescription>
                {editingSource 
                  ? `Update the details for ${editingSource.name}`
                  : 'Add a new CloudStream content source focused on Indian content'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newSource.name || ''}
                    onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Source name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="repo">Repository</Label>
                  <Select 
                    value={newSource.repo || ''}
                    onValueChange={(value) => setNewSource(prev => ({ ...prev, repo: value }))}
                  >
                    <SelectTrigger id="repo">
                      <SelectValue placeholder="Select repository" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIAN">INDIAN</SelectItem>
                      <SelectItem value="CSX">CSX</SelectItem>
                      <SelectItem value="PHISHER">PHISHER</SelectItem>
                      <SelectItem value="KEKIK">KEKIK</SelectItem>
                      <SelectItem value="RECLOUDSTREAM">RECLOUDSTREAM</SelectItem>
                      <SelectItem value="HEXATED">HEXATED</SelectItem>
                      <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                      {repositories.map(repo => (
                        <SelectItem key={repo.id} value={repo.name}>{repo.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={newSource.url || ''}
                  onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Source URL"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL (optional)</Label>
                  <Input
                    id="logo"
                    value={newSource.logo || ''}
                    onChange={(e) => setNewSource(prev => ({ ...prev, logo: e.target.value }))}
                    placeholder="Logo URL"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={newSource.language || ''}
                    onValueChange={(value) => setNewSource(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categories">Categories (comma-separated)</Label>
                <Input
                  id="categories"
                  value={(newSource.categories || []).join(', ')}
                  onChange={(e) => setNewSource(prev => ({ 
                    ...prev, 
                    categories: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                  }))}
                  placeholder="indian, movies, series, etc."
                />
                <p className="text-xs text-muted-foreground">
                  Always include "indian" for Indian content
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={newSource.description || ''}
                  onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the source"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_enabled"
                  checked={newSource.is_enabled}
                  onCheckedChange={(checked) => setNewSource(prev => ({ ...prev, is_enabled: checked }))}
                />
                <Label htmlFor="is_enabled">Enabled</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelSource}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSource}
                className="bg-moviemate-primary hover:bg-moviemate-primary/80"
                disabled={updateSourceMutation.isPending}
              >
                {updateSourceMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Repository Dialog */}
        <Dialog open={isAddingRepo} onOpenChange={setIsAddingRepo}>
          <DialogContent className="bg-moviemate-card/80 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>Add CloudStream Repository</DialogTitle>
              <DialogDescription>
                Add a new repository to access Indian content sources and plugins
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="repo-name">Repository Name</Label>
                <Input
                  id="repo-name"
                  value={newRepository.name}
                  onChange={(e) => setNewRepository(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., ReCloudStream"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="repo-url">Repository URL</Label>
                <Input
                  id="repo-url"
                  value={newRepository.url}
                  onChange={(e) => setNewRepository(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="e.g., https://github.com/recloudstream/extensions"
                />
                <p className="text-xs text-muted-foreground">
                  GitHub repository URL containing CloudStream extensions
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="repo-author">Author (optional)</Label>
                <Input
                  id="repo-author"
                  value={newRepository.author}
                  onChange={(e) => setNewRepository(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Repository author"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="repo-description">Description (optional)</Label>
                <Textarea
                  id="repo-description"
                  value={newRepository.description}
                  onChange={(e) => setNewRepository(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the repository"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSmartImport}
                  disabled={parseRepositoryMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {parseRepositoryMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Smart Import
                </Button>
                <p className="text-xs text-muted-foreground ml-2">
                  Automatically parse repository structure and import sources
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelRepository}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveRepository}
                className="bg-moviemate-primary hover:bg-moviemate-primary/80"
                disabled={addRepositoryMutation.isPending}
              >
                {addRepositoryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Repository"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Plugin Dialog */}
        <Dialog open={isAddingPlugin} onOpenChange={setIsAddingPlugin}>
          <DialogContent className="bg-moviemate-card/80 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>Add CloudStream Plugin</DialogTitle>
              <DialogDescription>
                Add a new plugin to extend CloudStream functionality
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="plugin-name">Plugin Name</Label>
                <Input
                  id="plugin-name"
                  value={newPlugin.name}
                  onChange={(e) => setNewPlugin(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., HindiProvider"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plugin-url">Plugin URL</Label>
                <Input
                  id="plugin-url"
                  value={newPlugin.url}
                  onChange={(e) => setNewPlugin(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="URL to the plugin .jar or source file"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plugin-repo">Repository</Label>
                <Select
                  value={newPlugin.repository}
                  onValueChange={(value) => setNewPlugin(prev => ({ ...prev, repository: value }))}
                >
                  <SelectTrigger id="plugin-repo">
                    <SelectValue placeholder="Select repository" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {repositories.map(repo => (
                      <SelectItem key={repo.id} value={repo.name}>{repo.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plugin-version">Version</Label>
                  <Input
                    id="plugin-version"
                    value={newPlugin.version}
                    onChange={(e) => setNewPlugin(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., 1.0.0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plugin-language">Language</Label>
                  <Select
                    value={newPlugin.language}
                    onValueChange={(value) => setNewPlugin(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger id="plugin-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                      <SelectItem value="">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plugin-categories">Categories (comma-separated)</Label>
                <Input
                  id="plugin-categories"
                  value={newPlugin.categories.join(', ')}
                  onChange={(e) => setNewPlugin(prev => ({ 
                    ...prev, 
                    categories: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                  }))}
                  placeholder="indian, movies, series, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plugin-description">Description (optional)</Label>
                <Textarea
                  id="plugin-description"
                  value={newPlugin.description}
                  onChange={(e) => setNewPlugin(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the plugin"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelPlugin}>
                Cancel
              </Button>
              <Button 
                onClick={handleSavePlugin}
                className="bg-moviemate-primary hover:bg-moviemate-primary/80"
                disabled={addPluginMutation.isPending}
              >
                {addPluginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Plugin"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCloudStream;
