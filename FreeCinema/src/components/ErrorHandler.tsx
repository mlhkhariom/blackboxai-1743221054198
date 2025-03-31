
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { errorToast } from '../services/error-handler';

interface ErrorHandlerProps {
  error: unknown;
  resetError?: () => void;
}

const ErrorHandler = ({ error, resetError }: ErrorHandlerProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      const errorMessage = errorToast(error);
      toast({
        title: "An error occurred",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return null; // This is a utility component, not a visual one
};

export default ErrorHandler;
