
import { useState } from 'react';
import { Plus, Upload, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface M3USource {
  id: string;
  name: string;
  url: string;
  isEnabled: boolean;
}

const M3UManager = () => {
  const [m3uSources, setM3USources] = useState<M3USource[]>([
    { id: '1', name: 'Free IPTV', url: 'https://example.com/playlist.m3u', isEnabled: true },
    { id: '2', name: 'Sports Channels', url: 'https://example.com/sports.m3u', isEnabled: false },
  ]);
  const [newM3UUrl, setNewM3UUrl] = useState('');
  const [newM3UName, setNewM3UName] = useState('');
  const [isAddingM3U, setIsAddingM3U] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAddM3U = () => {
    if (!newM3UName.trim() || !newM3UUrl.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a name and URL for the M3U source",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setM3USources([
        ...m3uSources,
        {
          id: Date.now().toString(),
          name: newM3UName,
          url: newM3UUrl,
          isEnabled: true
        }
      ]);
      setNewM3UName('');
      setNewM3UUrl('');
      setIsAddingM3U(false);
      setIsProcessing(false);
      toast({
        title: "Success",
        description: "M3U playlist source added successfully",
      });
    }, 1000);
  };

  const handleRemoveM3U = (id: string) => {
    setM3USources(m3uSources.filter(source => source.id !== id));
    toast({
      title: "Removed",
      description: "M3U playlist source removed successfully",
    });
  };

  const handleToggleM3U = (id: string) => {
    setM3USources(m3uSources.map(source => 
      source.id === id ? { ...source, isEnabled: !source.isEnabled } : source
    ));
    const source = m3uSources.find(s => s.id === id);
    toast({
      title: source?.isEnabled ? "Disabled" : "Enabled",
      description: `M3U playlist source ${source?.isEnabled ? 'disabled' : 'enabled'} successfully`,
    });
  };

  const handleSyncAllChannels = () => {
    setIsProcessing(true);
    // Simulate sync
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Sync Complete",
        description: "All M3U sources have been synchronized",
      });
    }, 2000);
  };

  return (
    <Card className="bg-moviemate-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-white">M3U Playlist Manager</CardTitle>
            <CardDescription>
              Add, edit, and sync M3U playlist sources for Live TV channels
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddingM3U} onOpenChange={setIsAddingM3U}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> 
                  Add M3U Source
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add M3U Playlist Source</DialogTitle>
                  <DialogDescription>
                    Add a new M3U playlist source by providing a name and URL
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={newM3UName} 
                      onChange={(e) => setNewM3UName(e.target.value)} 
                      placeholder="My IPTV List"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">M3U URL</Label>
                    <Input 
                      id="url" 
                      value={newM3UUrl} 
                      onChange={(e) => setNewM3UUrl(e.target.value)} 
                      placeholder="https://example.com/playlist.m3u"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingM3U(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddM3U}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Source
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleSyncAllChannels} disabled={isProcessing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
              Sync All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sources" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="sources">M3U Sources</TabsTrigger>
            <TabsTrigger value="settings">Sync Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sources" className="mt-4 space-y-4">
            {m3uSources.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <Upload size={40} className="mx-auto mb-2 text-muted-foreground" />
                <h3 className="mb-1 text-lg font-medium">No M3U Sources</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Add M3U playlist sources to import channels automatically
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingM3U(true)}
                >
                  Add M3U Source
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {m3uSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{source.name}</h3>
                      <p className="text-sm text-muted-foreground break-all">{source.url}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={source.isEnabled}
                        onCheckedChange={() => handleToggleM3U(source.id)}
                      />
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveM3U(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Settings</CardTitle>
                <CardDescription>
                  Configure how and when M3U playlists are synchronized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync M3U playlists on a schedule
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Sync Frequency</Label>
                    <p className="text-sm text-muted-foreground">
                      How often to sync M3U playlists
                    </p>
                  </div>
                  <select className="rounded-md border border-input bg-background px-3 py-2">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Remove Duplicates</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically remove duplicate channels during sync
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default M3UManager;
