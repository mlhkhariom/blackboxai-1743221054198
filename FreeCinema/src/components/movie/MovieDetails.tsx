
import { Movie } from '../../types';
import ContentHeader from '../content/ContentHeader';
import PlayerSection from '../content/PlayerSection';
import ContentDetails from '../ContentDetails';

interface MovieDetailsProps {
  movie: Movie;
  showPlayer: boolean;
  setShowPlayer: (show: boolean) => void;
}

const MovieDetails = ({ movie, showPlayer, setShowPlayer }: MovieDetailsProps) => {
  const getFormattedMovieDetails = () => {
    const title = movie.title;
    const formattedDate = movie.release_date 
      ? new Date(movie.release_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '';
    
    const formattedRuntime = movie.runtime 
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : '';
    
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';
    
    return { title, formattedDate, formattedRuntime, rating };
  };
  
  const { title, formattedDate, formattedRuntime, rating } = getFormattedMovieDetails();
  
  return (
    <div className="space-y-8">
      <ContentHeader 
        content={movie} 
        type="movie"
        title={title}
        formattedDate={formattedDate}
        formattedRuntime={formattedRuntime}
        rating={rating}
        showPlayer={showPlayer}
        setShowPlayer={setShowPlayer}
      />
      
      {showPlayer && (
        <PlayerSection 
          showPlayer={showPlayer}
          isMovie={true}
          contentId={movie.id}
          imdbId={movie.imdb_id}
          title={movie.title}
        />
      )}
      
      <ContentDetails content={movie} type="movie" />
    </div>
  );
};

export default MovieDetails;
