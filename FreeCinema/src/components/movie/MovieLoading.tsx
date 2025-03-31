
import { Card } from '@/components/ui/card';

const MovieLoading = () => {
  return (
    <Card className="w-full p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/3 rounded-md bg-muted"></div>
        <div className="h-4 w-1/3 rounded-md bg-muted"></div>
        <div className="h-32 w-full rounded-md bg-muted"></div>
      </div>
    </Card>
  );
};

export default MovieLoading;
