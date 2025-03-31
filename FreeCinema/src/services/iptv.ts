// IPTV API client based on https://github.com/iptv-org/api
import { safeFetch, handleAPIError } from './error-handler';

export interface Channel {
  id: string;
  name: string;
  country: string;
  subdivision: string;
  city: string;
  broadcast_area: string[];
  languages: string[];
  categories: string[];
  is_nsfw: boolean;
  website: string;
  logo: string;
}

export interface Stream {
  channel: string;
  url: string;
  http_referrer: string;
  user_agent: string;
  status: string;
  width: number;
  height: number;
  bitrate: number;
}

// Fallback URLs in case the primary URLs are blocked by CORS
const API_URLS = {
  channels: [
    'https://iptv-org.github.io/api/channels.json',
    'https://raw.githubusercontent.com/iptv-org/api/master/public/channels.json'
  ],
  streams: [
    'https://iptv-org.github.io/api/streams.json',
    'https://raw.githubusercontent.com/iptv-org/api/master/public/streams.json'
  ]
};

// Helper function to try multiple URLs with fallbacks
async function tryFetch<T>(urls: string[]): Promise<T> {
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await safeFetch(urls[i]);
      return await response.json();
    } catch (error) {
      // If this is the last URL, throw the error
      if (i === urls.length - 1) {
        throw error;
      }
      // Otherwise continue to the next URL
      console.warn(`Failed to fetch from ${urls[i]}, trying fallback...`);
    }
  }
  throw new Error('All fetch attempts failed');
}

export const fetchChannels = async (): Promise<Channel[]> => {
  try {
    return await tryFetch<Channel[]>(API_URLS.channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw handleAPIError(error);
  }
};

export const fetchIndianChannels = async (): Promise<Channel[]> => {
  try {
    const channels = await fetchChannels();
    return channels.filter(channel => 
      channel.broadcast_area.includes('India') || 
      channel.country === 'IN' ||
      channel.languages.includes('hin') || // Hindi
      channel.languages.includes('tam') || // Tamil
      channel.languages.includes('tel') || // Telugu
      channel.languages.includes('mal') || // Malayalam
      channel.languages.includes('kan') || // Kannada
      channel.languages.includes('ben') || // Bengali
      channel.languages.includes('mar') || // Marathi
      channel.languages.includes('guj')    // Gujarati
    );
  } catch (error) {
    console.error('Error fetching Indian channels:', error);
    throw handleAPIError(error);
  }
};

export const fetchStreams = async (): Promise<Stream[]> => {
  try {
    return await tryFetch<Stream[]>(API_URLS.streams);
  } catch (error) {
    console.error('Error fetching streams:', error);
    throw handleAPIError(error);
  }
};

export const getStreamForChannel = async (channelId: string): Promise<Stream | null> => {
  try {
    const streams = await fetchStreams();
    return streams.find(stream => stream.channel === channelId) || null;
  } catch (error) {
    console.error('Error getting stream for channel:', error);
    return null;
  }
};

export const getChannelsByCategory = async (category: string): Promise<Channel[]> => {
  try {
    const channels = await fetchChannels();
    return channels.filter(channel => channel.categories.includes(category));
  } catch (error) {
    console.error(`Error fetching ${category} channels:`, error);
    throw handleAPIError(error);
  }
};

// Cache streaming URLs to avoid repeated API calls
const streamCache = new Map<string, Stream>();

export const getCachedStreamForChannel = async (channelId: string): Promise<Stream | null> => {
  if (streamCache.has(channelId)) {
    return streamCache.get(channelId) || null;
  }
  
  const stream = await getStreamForChannel(channelId);
  if (stream) {
    streamCache.set(channelId, stream);
  }
  
  return stream;
};

// Clear cache after a certain period
setInterval(() => {
  streamCache.clear();
}, 30 * 60 * 1000); // Clear every 30 minutes
