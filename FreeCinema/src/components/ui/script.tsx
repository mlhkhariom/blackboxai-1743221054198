
import { useEffect, useState } from 'react';

interface ScriptProps {
  src: string;
  async?: boolean;
  defer?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const Script = ({ src, async = true, defer = false, onLoad, onError }: ScriptProps) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    
    if (existingScript) {
      setStatus('ready');
      onLoad?.();
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    setStatus('loading');
    
    // Event handlers
    script.onload = () => {
      setStatus('ready');
      onLoad?.();
    };
    
    script.onerror = () => {
      setStatus('error');
      onError?.();
    };
    
    // Append to document
    document.body.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      // Only remove script if it's not being used by other components
      if (document.querySelectorAll(`script[src="${src}"]`).length <= 1) {
        try {
          document.body.removeChild(script);
        } catch (e) {
          console.error("Error removing script:", e);
        }
      }
    };
  }, [src, async, defer, onLoad, onError]);
  
  return null;
};
