
import { Radio, Edit, Trash2, Play } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogTrigger } from '../../../components/ui/dialog';
import { Channel } from '../../../services/iptv';
import ChannelPreviewDialog from './ChannelPreviewDialog';
import { Skeleton } from '../../../components/ui/skeleton';

interface ChannelTableProps {
    loading: boolean;
    filteredChannels: Channel[];
    featuredChannels: string[];
    toggleFeaturedChannel: (channelId: string) => void;
}

const ChannelTable = ({ 
    loading, 
    filteredChannels, 
    featuredChannels, 
    toggleFeaturedChannel 
}: ChannelTableProps) => {
    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-md border p-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="hidden lg:table-cell">Languages</TableHead>
                        <TableHead className="w-[100px] text-center">Featured</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredChannels.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No channels found
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredChannels.map((channel) => (
                            <TableRow key={channel.id}>
                                <TableCell>
                                    {channel.logo ? (
                                        <img src={channel.logo} alt={channel.name} className="h-10 w-auto max-w-[40px] object-contain" />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/20">
                                            <Radio size={20} className="text-primary" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {channel.name}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="flex flex-wrap gap-1">
                                        {channel.categories.slice(0, 2).map((cat) => (
                                            <Badge key={cat} variant="secondary" className="whitespace-nowrap">
                                                {cat}
                                            </Badge>
                                        ))}
                                        {channel.categories.length > 2 && (
                                            <Badge variant="outline">+{channel.categories.length - 2}</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {channel.languages.length > 0 ? 
                                        channel.languages.slice(0, 2).join(', ') : 'N/A'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Switch 
                                        checked={featuredChannels.includes(channel.id)}
                                        onCheckedChange={() => toggleFeaturedChannel(channel.id)}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <ChannelPreviewDialog channel={channel} />
                                        </Dialog>
                                        
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ChannelTable;
