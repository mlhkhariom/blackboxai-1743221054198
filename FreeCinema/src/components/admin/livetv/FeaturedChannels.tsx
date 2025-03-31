
import { Radio, EyeOff } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { Channel } from '../../../services/iptv';

interface FeaturedChannelsProps {
    loading: boolean;
    allChannels: Channel[];
    featuredChannels: string[];
    toggleFeaturedChannel: (channelId: string) => void;
    onBrowseChannels: () => void;
}

const FeaturedChannels = ({ 
    loading, 
    allChannels, 
    featuredChannels, 
    toggleFeaturedChannel,
    onBrowseChannels
}: FeaturedChannelsProps) => {
    const featuredChannelItems = allChannels.filter(channel => featuredChannels.includes(channel.id));

    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Featured Channels</h3>
                <p className="text-sm text-muted-foreground">
                    {featuredChannels.length} channels featured
                </p>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-video w-full rounded-md" />
                    ))}
                </div>
            ) : featuredChannels.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                    <Radio size={40} className="mx-auto mb-2 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-medium">No Featured Channels</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Add channels to your featured list to display them prominently on the Live TV page.
                    </p>
                    <Button 
                        variant="outline" 
                        onClick={onBrowseChannels}
                    >
                        Browse Channels
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {featuredChannelItems.map(channel => (
                        <div 
                            key={channel.id} 
                            className="group relative overflow-hidden rounded-md border bg-card"
                        >
                            <div className="relative aspect-video bg-gradient-to-b from-transparent to-black/50 p-4">
                                {channel.logo ? (
                                    <img 
                                        src={channel.logo} 
                                        alt={channel.name}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Radio size={40} className="text-primary" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-3">
                                <h4 className="font-medium">{channel.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                    {channel.categories.slice(0, 2).join(', ')}
                                </p>
                            </div>
                            
                            <div className="absolute right-2 top-2 flex gap-1">
                                <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={() => toggleFeaturedChannel(channel.id)}
                                >
                                    <EyeOff className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeaturedChannels;
