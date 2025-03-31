
import { motion } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, HelpCircle } from "lucide-react";
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PlayerErrorProps {
  playerError: string | null;
  resetError: () => void;
}

const PlayerError = ({ playerError, resetError }: PlayerErrorProps) => {
  const [showHelp, setShowHelp] = useState(false);
  
  if (!playerError) return null;

  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Alert variant="destructive" className="border-0 bg-red-500/10">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="ml-2">
              <AlertTitle className="font-medium text-white">Player Error</AlertTitle>
              <AlertDescription className="text-gray-300">
                {playerError}. Please try again or check back later.
              </AlertDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={resetError}
              className="flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              Try Again
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-1.5 border-white/20 hover:bg-white/10"
            >
              <HelpCircle size={14} />
              {showHelp ? "Hide Help" : "Troubleshooting"}
            </Button>
          </div>
          
          {showHelp && (
            <motion.div 
              className="mt-2 rounded-md bg-white/5 p-3 text-sm text-gray-300"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="mb-1 font-medium text-white">Common Solutions:</h4>
              <ul className="list-inside list-disc space-y-1">
                <li>Check your internet connection and try refreshing</li>
                <li>Try a different browser or disable browser extensions</li>
                <li>The content source may be temporarily unavailable</li>
                <li>Wait a few minutes and try again later</li>
              </ul>
            </motion.div>
          )}
        </div>
      </Alert>
      
      <div className="absolute -bottom-8 -left-8 h-16 w-64 rounded-full bg-red-500/10 blur-xl"></div>
      <div className="absolute -top-8 -right-8 h-16 w-64 rounded-full bg-red-500/5 blur-xl"></div>
    </motion.div>
  );
};

export default PlayerError;
