import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import { fetchIndianChannels, getStreamForChannel, Channel, getChannelsByCategory } from '../services/iptv';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Play, Radio, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import LiveTVPlayer from '../components/LiveTVPlayer';

const LiveTV = () => {
  const { settings, liveTVCategories, featuredChannels } = useAdmin();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: channels, isLoading: isChannelsLoading, error } = useQuery({
    queryKey: ['indian-channels'],
    queryFn: fetchIndianChannels,
  });

  useEffect(() => {
    if (selectedChannel) {
      const fetchStream = async () => {
        setIsLoading(true);
        setStreamUrl(null);
        
        try {
          const stream = await getStreamForChannel(selectedChannel.id);
          if (stream) {
            setStreamUrl(stream.url);
          } else {
            toast({
              title: "Stream Unavailable",
              description: `No stream found for ${selectedChannel.name}`,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching stream:", error);
          toast({
            title: "Error",
            description: "Failed to load the stream. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchStream();
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedChannel, toast]);

  const categorizedChannels = channels ? 
    channels.reduce((acc: Record<string, Channel[]>, channel) => {
      channel.categories.forEach(category => {
        if (!acc[category]) acc[category] = [];
        acc[category].push(channel);
      });
      return acc;
    }, {}) : {};

  const categories = channels ? 
    Array.from(new Set(channels.flatMap(channel => channel.categories)))
      .filter(category => {
        if (liveTVCategories.length > 0) {
          const adminCategory = liveTVCategories.find(cat => cat.id === category);
          return adminCategory ? adminCategory.isEnabled : false;
        }
        return Boolean(category);
      })
      .sort((a, b) => {
        if (liveTVCategories.length > 0) {
          const catA = liveTVCategories.find(cat => cat.id === a);
          const catB = liveTVCategories.find(cat => cat.id === b);
          return (catA?.order || 0) - (catB?.order || 0);
        }
        return a.localeCompare(b);
      }) : [];

  const filteredChannels = activeCategory === 'all' 
    ? channels 
    : (categorizedChannels[activeCategory] || []);

  const featuredChannelsList = channels ? 
    channels.filter(channel => featuredChannels.includes(channel.id)) 
    : [];

  const handleBackClick = useCallback(() => {
    setSelectedChannel(null);
    setStreamUrl(null);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    },
    hover: {
      y: -10,
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
      transition: {
        type: 'spring',
        stiffness: 200
      }
    }
  };

  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 pt-24">
        {selectedChannel ? (
          <>
            <div className="mb-8 flex items-center gap-2">
              <button 
                onClick={handleBackClick}
                className="flex items-center gap-1 rounded-md bg-moviemate-card px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-moviemate-card/80"
              >
                <ArrowLeft size={16} />
                <span>Back to Channels</span>
              </button>
              <h1 className="text-2xl font-bold text-white">
                {selectedChannel.name}
              </h1>
            </div>
            
            <div className="mb-8">
              <LiveTVPlayer 
                channel={selectedChannel}
                streamUrl={streamUrl}
                onBackClick={handleBackClick}
                isLoading={isLoading}
              />
            </div>
            
            <motion.div 
              className="mb-8 rounded-xl bg-moviemate-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-moviemate-primary/20 to-black/60 p-2">
                  {selectedChannel.logo ? (
                    <img 
                      src={selectedChannel.logo} 
                      alt={selectedChannel.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Radio size={40} className="text-moviemate-primary" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="mb-2 text-xl font-bold text-white">{selectedChannel.name}</h2>
                  
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedChannel.categories.map((category, index) => (
                      <span key={index} className="rounded-full bg-moviemate-primary/20 px-3 py-1 text-xs font-medium text-white">
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-300">
                    {selectedChannel.languages.length > 0 && (
                      <p>Languages: {selectedChannel.languages.join(', ')}</p>
                    )}
                    {selectedChannel.broadcast_area.length > 0 && (
                      <p>Broadcast Area: {selectedChannel.broadcast_area.join(', ')}</p>
                    )}
                    {selectedChannel.website && (
                      <p>
                        Website: <a 
                          href={selectedChannel.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-moviemate-primary hover:underline"
                        >
                          {selectedChannel.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {filteredChannels && filteredChannels.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-4 text-xl font-bold text-white">Related Channels</h2>
                <motion.div 
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredChannels
                    .filter(channel => channel.id !== selectedChannel.id)
                    .slice(0, 10)
                    .map(channel => (
                      <motion.div 
                        key={channel.id}
                        className="group cursor-pointer overflow-hidden rounded-lg bg-moviemate-card transition-all"
                        onClick={() => setSelectedChannel(channel)}
                        variants={cardVariants}
                        whileHover="hover"
                      >
                        <div className="relative aspect-video bg-gradient-to-br from-purple-800/20 to-black/60">
                          {channel.logo ? (
                            <img 
                              src={channel.logo} 
                              alt={channel.name}
                              className="h-full w-full object-contain p-4"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Radio size={30} className="text-white opacity-50" />
                            </div>
                          )}
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <motion.div 
                              className="rounded-full bg-moviemate-primary/90 p-3 backdrop-blur-sm"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Play size={24} className="text-white" />
                            </motion.div>
                          </motion.div>
                        </div>
                        <div className="p-3">
                          <h3 className="mb-1 truncate text-sm font-medium text-white">
                            {channel.name}
                          </h3>
                          <p className="truncate text-xs text-gray-400">
                            {channel.categories.slice(0, 2).join(' • ')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="mb-6 text-3xl font-bold text-white">Live TV <span className="text-moviemate-primary">India</span></h1>
            
            {error ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load channels. Please try again later.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {featuredChannelsList.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-white">Featured Channels</h2>
                    <motion.div 
                      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {featuredChannelsList.map(channel => (
                        <motion.div 
                          key={channel.id}
                          className="group cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-moviemate-primary/10 to-purple-900/5 transition-all"
                          onClick={() => setSelectedChannel(channel)}
                          variants={cardVariants}
                          whileHover="hover"
                        >
                          <div className="relative aspect-video bg-gradient-to-br from-purple-800/20 to-black/60">
                            {channel.logo ? (
                              <img 
                                src={channel.logo} 
                                alt={channel.name}
                                className="h-full w-full object-contain p-4"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Radio size={30} className="text-white opacity-50" />
                              </div>
                            )}
                            <motion.div 
                              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                            >
                              <motion.div 
                                className="rounded-full bg-moviemate-primary/90 p-3 backdrop-blur-sm"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Play size={24} className="text-white" />
                              </motion.div>
                            </motion.div>
                          </div>
                          <div className="p-3">
                            <h3 className="mb-1 truncate text-sm font-medium text-white">
                              {channel.name}
                            </h3>
                            <p className="truncate text-xs text-gray-400">
                              {channel.categories.slice(0, 2).join(' • ')}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}
                
                <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveCategory}>
                  <TabsList className="mb-4 grid w-full auto-cols-fr grid-flow-col overflow-x-auto sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                    <TabsTrigger value="all">All</TabsTrigger>
                    {categories.slice(0, 7).map(category => (
                      <TabsTrigger key={category} value={category}>
                        {liveTVCategories.find(cat => cat.id === category)?.name || 
                          category.charAt(0).toUpperCase() + category.slice(1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  <TabsContent value={activeCategory} className="mt-0">
                    <motion.div 
                      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {isChannelsLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="overflow-hidden rounded-lg bg-moviemate-card">
                            <Skeleton className="aspect-video w-full" />
                            <div className="p-3">
                              <Skeleton className="mb-2 h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))
                      ) : filteredChannels?.length ? (
                        filteredChannels.map(channel => (
                          <motion.div 
                            key={channel.id}
                            className="group cursor-pointer overflow-hidden rounded-lg bg-moviemate-card transition-all"
                            onClick={() => setSelectedChannel(channel)}
                            variants={cardVariants}
                            whileHover="hover"
                          >
                            <div className="relative aspect-video bg-gradient-to-br from-purple-800/20 to-black/60">
                              {channel.logo ? (
                                <img 
                                  src={channel.logo} 
                                  alt={channel.name}
                                  className="h-full w-full object-contain p-4"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Radio size={30} className="text-white opacity-50" />
                                </div>
                              )}
                              <motion.div 
                                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                              >
                                <motion.div 
                                  className="rounded-full bg-moviemate-primary/90 p-3 backdrop-blur-sm"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Play size={24} className="text-white" />
                                </motion.div>
                              </motion.div>
                            </div>
                            <div className="p-3">
                              <h3 className="mb-1 truncate text-sm font-medium text-white">
                                {channel.name}
                              </h3>
                              <p className="truncate text-xs text-gray-400">
                                {channel.categories.slice(0, 2).join(' • ')}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-full rounded-lg bg-moviemate-card p-8 text-center">
                          <AlertCircle size={40} className="mx-auto mb-2 text-moviemate-primary" />
                          <h3 className="text-xl font-medium text-white">No Channels Found</h3>
                          <p className="text-gray-400">
                            No channels available in this category
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default LiveTV;
