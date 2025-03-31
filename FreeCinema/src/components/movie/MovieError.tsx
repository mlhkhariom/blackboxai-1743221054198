
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface MovieErrorProps {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const MovieError = ({ message, onRetry, isRetrying = false }: MovieErrorProps) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center rounded-xl bg-moviemate-card p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h2 className="mb-2 text-xl font-bold">Failed to Load Content</h2>
      <p className="mb-6 max-w-lg text-gray-400">{message}</p>
      
      {onRetry && (
        <Button 
          variant="default" 
          className="flex items-center gap-2"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </Button>
      )}
    </motion.div>
  );
};

export default MovieError;
