
import { safeFetch, handleAPIError } from './error-handler';
import { supabase } from "@/integrations/supabase/client";

// Define base types for CloudStream content
export interface CloudStreamSource {
  id?: string;
  name: string;
  url: string;
  logo?: string;
  language?: string;
  categories?: string[];
  repo: string;
  description?: string;
  is_enabled?: boolean;
}

export interface CloudStreamContent {
  id: string;
  title: string;
  year?: number;
  poster?: string;
  backdrop?: string;
  plot?: string;
  rating?: number;
  type: 'movie' | 'series';
  url: string;
  source: string;
  external_id?: string;
}

export interface CloudStreamSearchResponse {
  results: CloudStreamContent[];
  hasMore: boolean;
}

export interface CloudStreamSearchFilters {
  language?: string;
  category?: string;
  indianContent?: boolean;
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface CloudStreamPlugin {
  id?: string;
  name: string;
  url: string;
  version?: string;
  description?: string;
  language?: string;
  categories?: string[];
  repository?: string;
  author?: string;
  is_enabled?: boolean;
}

export interface CloudStreamRepository {
  id?: string;
  name: string;
  url: string;
  description?: string;
  author?: string;
  is_enabled?: boolean;
  plugins?: CloudStreamPlugin[];
}

// Base URLs for the CloudStream extension APIs
const CS_REPOS = {
  CSX: {
    name: 'CSX',
    url: 'https://raw.githubusercontent.com/SaurabhKaperwan/CSX/master',
    apiUrl: 'https://api.github.com/repos/SaurabhKaperwan/CSX/contents'
  },
  PHISHER: {
    name: 'Phisher',
    url: 'https://raw.githubusercontent.com/phisher98/cloudstream-extensions-phisher/main',
    apiUrl: 'https://api.github.com/repos/phisher98/cloudstream-extensions-phisher/contents'
  },
  KEKIK: {
    name: 'Kekik',
    url: 'https://raw.githubusercontent.com/keyiflerolsun/Kekik-cloudstream/main',
    apiUrl: 'https://api.github.com/repos/keyiflerolsun/Kekik-cloudstream/contents'
  },
  HEXATED: {
    name: 'Hexated',
    url: 'https://raw.githubusercontent.com/hexated/cloudstream-extensions-hexated/builds',
    apiUrl: 'https://api.github.com/repos/hexated/cloudstream-extensions-hexated/contents'
  },
  RECLOUDSTREAM: {
    name: 'ReCloudStream',
    url: 'https://raw.githubusercontent.com/recloudstream/extensions/builds',
    apiUrl: 'https://api.github.com/repos/recloudstream/extensions/contents'
  }
};

// Available sources from the extensions - focusing on Indian content
const CSX_SOURCES: CloudStreamSource[] = [
  { name: 'JioTV', url: `${CS_REPOS.CSX.url}/JioTV/src/main/kotlin/com/jeetv/JioTV.kt`, language: 'hi', categories: ['indian', 'live'], repo: 'CSX' },
  { name: 'AnimeIndoProvider', url: `${CS_REPOS.CSX.url}/AnimeIndoProvider/src/main/kotlin/com/animeindo/AnimeIndoProvider.kt`, language: 'id', categories: ['anime'], repo: 'CSX' },
];

const PHISHER_SOURCES: CloudStreamSource[] = [
  { name: 'TinyTv', url: `${CS_REPOS.PHISHER.url}/TinyTv/src/main/kotlin/com/phisher/TinyTv.kt`, language: 'hi', categories: ['indian', 'movies', 'series'], repo: 'PHISHER' },
];

const RECLOUDSTREAM_SOURCES: CloudStreamSource[] = [
  { name: 'HindiLover', url: `${CS_REPOS.RECLOUDSTREAM.url}/HindiLover.cs`, language: 'hi', categories: ['indian', 'movies', 'series'], repo: 'RECLOUDSTREAM', description: 'Hindi movies and series provider' },
  { name: 'MultiProviders', url: `${CS_REPOS.RECLOUDSTREAM.url}/MultiProviders.cs`, categories: ['movies', 'series', 'anime'], repo: 'RECLOUDSTREAM', description: 'Multiprovider for various streaming sites' },
];

// Indian sources specifically
const INDIAN_SOURCES: CloudStreamSource[] = [
  { name: 'Hotstar', url: 'https://example.com/hotstar', language: 'hi', categories: ['indian', 'movies', 'series'], repo: 'INDIAN', description: 'Disney+ Hotstar content provider' },
  { name: 'SonyLIV', url: 'https://example.com/sonyliv', language: 'hi', categories: ['indian', 'movies', 'series'], repo: 'INDIAN', description: 'SonyLIV content provider' },
  { name: 'Zee5', url: 'https://example.com/zee5', language: 'hi', categories: ['indian', 'movies', 'series'], repo: 'INDIAN', description: 'Zee5 content provider' },
  { name: 'MXPlayer', url: 'https://example.com/mxplayer', language: 'hi', categories: ['indian', 'movies', 'series'], repo: 'INDIAN', description: 'MX Player content provider' },
  { name: 'Voot', url: 'https://example.com/voot', language: 'hi', categories: ['indian', 'movies', 'series'], repo: 'INDIAN', description: 'Voot content provider' },
  { name: 'AltBalaji', url: 'https://example.com/altbalaji', language: 'hi', categories: ['indian', 'series'], repo: 'INDIAN', description: 'AltBalaji content provider' },
  { name: 'ErosNow', url: 'https://example.com/erosnow', language: 'hi', categories: ['indian', 'movies'], repo: 'INDIAN', description: 'Eros Now content provider' },
];

// Combined sources with Indian sources first for priority
export const CLOUDSTREAM_SOURCES = [...INDIAN_SOURCES, ...CSX_SOURCES, ...PHISHER_SOURCES, ...RECLOUDSTREAM_SOURCES]
  .filter(source => source.language === 'hi' || (source.categories && source.categories.includes('indian')) || source.repo === 'INDIAN')
  .sort((a, b) => {
    // Sort by Indian content first
    const aIsIndian = a.language === 'hi' || (a.categories && a.categories.includes('indian')) || a.repo === 'INDIAN';
    const bIsIndian = b.language === 'hi' || (b.categories && b.categories.includes('indian')) || b.repo === 'INDIAN';
    
    if (aIsIndian && !bIsIndian) return -1;
    if (!aIsIndian && bIsIndian) return 1;
    
    // Then sort alphabetically
    return a.name.localeCompare(b.name);
  });

// Get all available Indian languages
export const INDIAN_LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
];

// Sync predefined sources to Supabase
export const syncSourcesToSupabase = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${window.location.origin}/api/sync-cloudstream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'syncSources',
        sources: CLOUDSTREAM_SOURCES
      }),
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error syncing sources to Supabase:', error);
    return false;
  }
};

// Get all available sources from Supabase with realtime support
export const fetchAllSources = async (): Promise<CloudStreamSource[]> => {
  try {
    const { data: sources, error } = await supabase
      .from('cloudstream_sources')
      .select('*')
      .eq('is_enabled', true)
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return sources || [];
  } catch (error) {
    console.error('Error fetching CloudStream sources:', error);
    return CLOUDSTREAM_SOURCES; // Fallback to static list if API fails
  }
};

// Get all repositories
export const fetchAllRepositories = async (): Promise<CloudStreamRepository[]> => {
  try {
    const response = await fetch(`${window.location.origin}/api/sync-cloudstream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getRepositories'
      }),
    });
    
    const result = await response.json();
    if (result.success) {
      return result.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching CloudStream repositories:', error);
    return [];
  }
};

// Get all plugins
export const fetchAllPlugins = async (): Promise<CloudStreamPlugin[]> => {
  try {
    const response = await fetch(`${window.location.origin}/api/sync-cloudstream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getPlugins'
      }),
    });
    
    const result = await response.json();
    if (result.success) {
      return result.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching CloudStream plugins:', error);
    return [];
  }
};

// Add a new repository
export const addRepository = async (repo: {
  name: string;
  url: string;
  description?: string;
  author?: string;
}): Promise<boolean> => {
  try {
    const response = await fetch(`${window.location.origin}/api/sync-cloudstream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addRepository',
        repo
      }),
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error adding repository:', error);
    return false;
  }
};

// Add a new plugin
export const addPlugin = async (plugin: {
  name: string;
  url: string;
  version?: string;
  description?: string;
  author?: string;
  repository?: string;
  categories?: string[];
  language?: string;
}): Promise<boolean> => {
  try {
    const response = await fetch(`${window.location.origin}/api/sync-cloudstream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addPlugin',
        plugin
      }),
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error adding plugin:', error);
    return false;
  }
};

// Sync content from all enabled sources
export const syncContent = async (): Promise<{success: boolean; message: string}> => {
  try {
    const response = await fetch(`${window.location.origin}/api/sync-cloudstream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'syncContent'
      }),
    });
    
    const result = await response.json();
    return {
      success: result.success,
      message: result.message || 'Content sync completed'
    };
  } catch (error) {
    console.error('Error syncing content:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Search content with Supabase and real-time data
export const searchCloudStreamContent = async (
  query: string,
  sourceIds: string[] = [],
  filters: CloudStreamSearchFilters = { indianContent: true }
): Promise<CloudStreamSearchResponse> => {
  try {
    // First, try to get real content from Supabase
    const apiFilters = {
      ...filters,
      query,
      page: 1,
      pageSize: 20
    };
    
    const response = await fetch(`${window.location.origin}/api/sync-cloudstream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'searchContent',
        filters: apiFilters
      }),
    });
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.length > 0) {
      // Format the results
      const results: CloudStreamContent[] = result.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        year: item.year,
        poster: item.poster,
        backdrop: item.backdrop,
        plot: item.plot,
        rating: item.rating,
        type: item.type as 'movie' | 'series',
        url: `/cloudstream/${item.cloudstream_sources?.name}/${item.external_id}`,
        source: item.cloudstream_sources?.name || 'Unknown'
      }));
      
      return {
        results,
        hasMore: results.length < (result.total || 0)
      };
    }
    
    // If no data in Supabase yet, fall back to mock data with Indian focus
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock results
    const results: CloudStreamContent[] = [];
    
    // Filter sources to prioritize Indian content
    const sources = sourceIds.length > 0 
      ? CLOUDSTREAM_SOURCES.filter(s => sourceIds.includes(s.name))
      : CLOUDSTREAM_SOURCES.filter(s => 
          s.language === 'hi' || 
          (s.categories && s.categories.includes('indian')) ||
          ['INDIAN'].includes(s.repo)
        );
    
    // Generate 0-5 mock results per source based on the query
    sources.forEach(source => {
      const resultCount = Math.floor(Math.random() * 6); // 0-5 results
      
      for (let i = 0; i < resultCount; i++) {
        if (query.length > 0 && Math.random() > 0.7) continue; // Skip some results for non-empty queries
        
        const languages = ['hi', 'ta', 'te', 'ml', 'kn', 'bn'];
        const language = source.language || languages[Math.floor(Math.random() * languages.length)];
        const languageName = INDIAN_LANGUAGES.find(l => l.code === language)?.name || language;
        
        results.push({
          id: `${source.name}-${Date.now()}-${i}`,
          title: query.length > 0 
            ? `${query} ${i + 1} (${languageName})` 
            : `Indian ${source.name} ${i + 1} (${languageName})`,
          year: 2020 + Math.floor(Math.random() * 4),
          poster: `https://picsum.photos/seed/${source.name}${i}/300/450`,
          backdrop: `https://picsum.photos/seed/${source.name}${i}-bg/1280/720`,
          plot: `This is a sample ${languageName} content item from the ${source.name} source.`,
          rating: Math.floor(Math.random() * 100) / 10,
          type: Math.random() > 0.5 ? 'movie' : 'series',
          url: `/cloudstream/${source.name}/${i}`,
          source: source.name
        });
      }
    });
    
    return {
      results,
      hasMore: results.length > 0 && Math.random() > 0.3 // Randomly determine if there are more results
    };
  } catch (error) {
    console.error('Error searching CloudStream content:', error);
    return {
      results: [],
      hasMore: false
    };
  }
};

// Get content details from Supabase
export const getCloudStreamContentDetails = async (
  contentId: string,
  sourceId: string
): Promise<CloudStreamContent | null> => {
  try {
    // Try to get from Supabase first
    const { data, error } = await supabase
      .from('cloudstream_content')
      .select('*, cloudstream_sources(name)')
      .eq('external_id', contentId)
      .eq('cloudstream_sources.name', sourceId)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    // If we found the content in Supabase, return it
    if (data) {
      return {
        id: data.id,
        title: data.title,
        year: data.year,
        poster: data.poster,
        backdrop: data.backdrop,
        plot: data.plot,
        rating: data.rating,
        type: data.type as 'movie' | 'series',
        url: `/cloudstream/${data.cloudstream_sources.name}/${data.external_id}`,
        source: data.cloudstream_sources.name,
        external_id: data.external_id
      };
    }
    
    // Find the source
    const source = CLOUDSTREAM_SOURCES.find(s => s.name === sourceId);
    if (!source) return null;
    
    // Mock content details as fallback with Indian focus
    const languages = ['hi', 'ta', 'te', 'ml', 'kn', 'bn'];
    const language = source.language || languages[Math.floor(Math.random() * languages.length)];
    const languageName = INDIAN_LANGUAGES.find(l => l.code === language)?.name || language;
    
    return {
      id: contentId,
      title: `${sourceId} ${languageName} Content ${contentId}`,
      year: 2022,
      poster: `https://picsum.photos/seed/${sourceId}${contentId}/300/450`,
      backdrop: `https://picsum.photos/seed/${sourceId}${contentId}-bg/1280/720`,
      plot: `This is a detailed description for ${languageName} content from ${sourceId}.`,
      rating: 8.5,
      type: Math.random() > 0.5 ? 'movie' : 'series',
      url: `/cloudstream/${sourceId}/${contentId}`,
      source: sourceId,
      external_id: contentId
    };
  } catch (error) {
    console.error('Error fetching CloudStream content details:', error);
    return null;
  }
};

// Listen for real-time updates to CloudStream content
export const subscribeToCloudStreamUpdates = (callback: () => void) => {
  const channel = supabase
    .channel('cloudstream-changes')
    .on('postgres_changes', 
      {
        event: '*', 
        schema: 'public',
        table: 'cloudstream_content'
      }, 
      () => {
        callback();
      }
    )
    .on('postgres_changes', 
      {
        event: '*', 
        schema: 'public',
        table: 'cloudstream_sources'
      }, 
      () => {
        callback();
      }
    )
    .on('postgres_changes', 
      {
        event: '*', 
        schema: 'public',
        table: 'cloudstream_plugins'
      }, 
      () => {
        callback();
      }
    )
    .on('postgres_changes', 
      {
        event: '*', 
        schema: 'public',
        table: 'cloudstream_repositories'
      }, 
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Parse CloudStream GitHub repository
export const parseCloudStreamRepo = async (repoUrl: string): Promise<{
  sources: CloudStreamSource[];
  plugins: CloudStreamPlugin[];
}> => {
  try {
    // For GitHub repos
    if (repoUrl.includes('github.com')) {
      const apiUrl = repoUrl.replace('github.com', 'api.github.com/repos') + '/contents';
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch repository content: ${response.statusText}`);
      }
      
      const contents = await response.json();
      
      // Look for repo.json file that CloudStream repos typically use
      const repoJsonFile = contents.find((item: any) => item.name === 'repo.json');
      
      if (repoJsonFile) {
        const rawUrl = repoJsonFile.download_url;
        const repoJsonResponse = await fetch(rawUrl);
        
        if (repoJsonResponse.ok) {
          const repoData = await repoJsonResponse.json();
          
          const plugins: CloudStreamPlugin[] = [];
          const sources: CloudStreamSource[] = [];
          
          // Process plugins from repo.json
          if (repoData.plugins && Array.isArray(repoData.plugins)) {
            repoData.plugins.forEach((plugin: any) => {
              plugins.push({
                name: plugin.name,
                url: plugin.url,
                version: plugin.version || '1.0.0',
                description: plugin.description || null,
                language: plugin.language || null,
                categories: plugin.categories || [],
                repository: repoUrl
              });
              
              // Each plugin potentially contains sources
              if (plugin.sources && Array.isArray(plugin.sources)) {
                plugin.sources.forEach((source: any) => {
                  sources.push({
                    name: source.name,
                    url: source.url,
                    language: source.language || plugin.language,
                    categories: source.categories || plugin.categories,
                    repo: repoUrl.split('/').pop() || 'Unknown'
                  });
                });
              }
            });
          }
          
          return { sources, plugins };
        }
      }
      
      // If no repo.json found, try to scan for Kotlin files that might be providers
      const sources: CloudStreamSource[] = [];
      const plugins: CloudStreamPlugin[] = [];
      
      // Find directories that might be plugins
      const dirs = contents.filter((item: any) => item.type === 'dir');
      
      for (const dir of dirs) {
        // Assuming each directory is a plugin
        // Look for plugin metadata (you might need to download additional files)
        const dirUrl = dir.url;
        const dirResponse = await fetch(dirUrl);
        
        if (dirResponse.ok) {
          const dirContents = await dirResponse.json();
          
          // Look for Kotlin files that could be providers
          const kotlinFiles = dirContents.filter((item: any) => 
            item.name.endsWith('.kt') && item.name.includes('Provider'));
          
          // Add each provider as a source
          for (const ktFile of kotlinFiles) {
            sources.push({
              name: dir.name,
              url: ktFile.download_url,
              repo: repoUrl.split('/').pop() || 'Unknown'
            });
          }
          
          // Add the directory as a plugin
          plugins.push({
            name: dir.name,
            url: dir.html_url,
            repository: repoUrl
          });
        }
      }
      
      return { sources, plugins };
    }
    
    // For non-GitHub repos
    return { sources: [], plugins: [] };
  } catch (error) {
    console.error('Error parsing CloudStream repository:', error);
    return { sources: [], plugins: [] };
  }
};
