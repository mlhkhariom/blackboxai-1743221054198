
import { useEffect, useState } from 'react';
import { PlusCircle, RefreshCw, Layers } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Channel, getChannelsByCategory, fetchChannels } from '../../services/iptv';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { useAdmin } from '../../contexts/AdminContext';
import DataTableSearch from '../../components/admin/livetv/DataTableSearch';
import ChannelTable from '../../components/admin/livetv/ChannelTable';
import FeaturedChannels from '../../components/admin/livetv/FeaturedChannels';
import M3UManager from '../../components/admin/livetv/M3UManager';

const AdminLiveTV = () => {
    const [allChannels, setAllChannels] = useState<Channel[]>([]);
    const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
    const [category, setCategory] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const { toast } = useToast();
    const { liveTVCategories, featuredChannels, updateFeaturedChannels } = useAdmin();

    const fetchAllChannels = async () => {
        setLoading(true);
        try {
            const channelsData = await fetchChannels();
            setAllChannels(channelsData);
            setFilteredChannels(channelsData);
        } catch (error) {
            console.error("Failed to fetch channels:", error);
            toast({
                title: "Error",
                description: "Failed to fetch channels. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllChannels();
    }, [toast]);

    const handleCategoryChange = async (selectedCategory: string) => {
        setCategory(selectedCategory);
        setLoading(true);
        
        try {
            let channelsData;
            if (selectedCategory === 'all') {
                channelsData = await fetchChannels();
            } else {
                channelsData = await getChannelsByCategory(selectedCategory);
            }
            
            setAllChannels(channelsData);
            setFilteredChannels(channelsData);
        } catch (error) {
            console.error("Failed to fetch channels:", error);
            toast({
                title: "Error",
                description: "Failed to fetch channels. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshChannels = async () => {
        setRefreshing(true);
        try {
            await fetchAllChannels();
            toast({
                title: "Success",
                description: "Channel list refreshed successfully",
            });
        } catch (error) {
            console.error("Failed to refresh channels:", error);
            toast({
                title: "Error",
                description: "Failed to refresh channels. Please try again.",
                variant: "destructive",
            });
        } finally {
            setRefreshing(false);
        }
    };

    const toggleFeaturedChannel = (channelId: string) => {
        const isFeatured = featuredChannels.includes(channelId);
        let updatedFeatured;
        
        if (isFeatured) {
            updatedFeatured = featuredChannels.filter(id => id !== channelId);
        } else {
            updatedFeatured = [...featuredChannels, channelId];
        }
        
        updateFeaturedChannels(updatedFeatured);
        
        toast({
            title: isFeatured ? "Removed from Featured" : "Added to Featured",
            description: `Channel has been ${isFeatured ? 'removed from' : 'added to'} featured list`,
        });
    };

    const handleFilteredChannels = (filtered: Channel[]) => {
        setFilteredChannels(filtered);
    };

    const handleBrowseChannelsClick = () => {
        const browseTab = document.querySelector('[data-value="browse"]');
        if (browseTab && browseTab instanceof HTMLElement) {
            browseTab.click();
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto py-10">
                <Tabs defaultValue="channels" className="space-y-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <TabsList className="bg-moviemate-card/60">
                            <TabsTrigger value="channels">Channel Manager</TabsTrigger>
                            <TabsTrigger value="m3u">M3U Sources</TabsTrigger>
                        </TabsList>
                        
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleRefreshChannels}
                                disabled={refreshing}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> 
                                Add Custom Channel
                            </Button>
                        </div>
                    </div>
                    
                    <TabsContent value="channels">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <CardTitle>Live TV Channels</CardTitle>
                                        <CardDescription>Manage and view live TV channels by category.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <Tabs defaultValue="browse" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                                            <TabsTrigger value="browse">Browse Channels</TabsTrigger>
                                            <TabsTrigger value="featured">Featured Channels</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="browse" className="mt-4">
                                            <div className="grid gap-4">
                                                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                                    <Select value={category} onValueChange={handleCategoryChange}>
                                                        <SelectTrigger className="w-[200px]">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Categories</SelectItem>
                                                            <SelectItem value="movies">Movies</SelectItem>
                                                            <SelectItem value="news">News</SelectItem>
                                                            <SelectItem value="sports">Sports</SelectItem>
                                                            <SelectItem value="entertainment">Entertainment</SelectItem>
                                                            <SelectItem value="music">Music</SelectItem>
                                                            <SelectItem value="documentary">Documentary</SelectItem>
                                                            <SelectItem value="kids">Kids</SelectItem>
                                                            <SelectItem value="general">General</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <DataTableSearch data={allChannels} onFilter={handleFilteredChannels} />
                                                
                                                <ChannelTable 
                                                    loading={loading}
                                                    filteredChannels={filteredChannels}
                                                    featuredChannels={featuredChannels}
                                                    toggleFeaturedChannel={toggleFeaturedChannel}
                                                />
                                            </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="featured" className="mt-4">
                                            <FeaturedChannels 
                                                loading={loading}
                                                allChannels={allChannels}
                                                featuredChannels={featuredChannels}
                                                toggleFeaturedChannel={toggleFeaturedChannel}
                                                onBrowseChannels={handleBrowseChannelsClick}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {filteredChannels.length} of {allChannels.length} channels
                                </p>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="m3u">
                        <M3UManager />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default AdminLiveTV;
