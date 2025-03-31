
import React from 'react';
import { Badge } from './ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Star, Calendar, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Movie, TvShow } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

// Props for direct values
interface ContentDetailsProps {
  title?: string;
  overview?: string;
  releaseDate?: string;
  runtime?: number;
  rating?: number;
  genres?: { id: number; name: string }[];
  type: 'movie' | 'tv';
}

// Props for passing content object
interface ContentObjectProps {
  content: Movie | TvShow;
  type: 'movie' | 'tv';
}

// Type guard to check which prop type we're receiving
function isContentObject(props: ContentDetailsProps | ContentObjectProps): props is ContentObjectProps {
  return 'content' in props;
}

const ContentDetails = (props: ContentDetailsProps | ContentObjectProps) => {
  // Extract props based on what was passed
  const {
    title,
    overview,
    releaseDate,
    runtime,
    rating,
    genres,
    type
  } = isContentObject(props) 
    ? {
        title: props.type === 'movie' 
          ? (props.content as Movie).title 
          : (props.content as TvShow).name,
        overview: props.content.overview,
        releaseDate: props.type === 'movie' 
          ? (props.content as Movie).release_date 
          : (props.content as TvShow).first_air_date,
        runtime: props.type === 'movie' 
          ? (props.content as Movie).runtime 
          : undefined,
        rating: props.content.vote_average,
        genres: props.content.genres,
        type: props.type
      } 
    : props;

  // Format release date
  const formattedDate = releaseDate 
    ? new Date(releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  // Format runtime
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="container mx-auto my-8 max-w-5xl bg-card">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold">
          About this {type === 'movie' ? 'Movie' : 'TV Show'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Tag className="h-4 w-4" />
            {genres.map((genre, index) => (
              <HoverCard key={index}>
                <HoverCardTrigger>
                  <Badge variant="outline" className="cursor-pointer">
                    {genre.name}
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-48">
                  <p className="text-sm">More {genre.name} content</p>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Synopsis</h3>
            <p className="text-muted-foreground">
              {overview || 'No overview available.'}
            </p>
          </div>
          
          <div className="space-y-4">
            {releaseDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Release Date</span>
                  <p className="text-muted-foreground">{formattedDate}</p>
                </div>
              </div>
            )}
            
            {runtime && runtime > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Runtime</span>
                  <p className="text-muted-foreground">{formatRuntime(runtime)}</p>
                </div>
              </div>
            )}
            
            {rating && rating > 0 && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <span className="text-sm font-medium">Rating</span>
                  <p className="text-muted-foreground">{rating.toFixed(1)}/10</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentDetails;
