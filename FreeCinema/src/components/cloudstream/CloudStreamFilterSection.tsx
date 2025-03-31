
import { CLOUDSTREAM_SOURCES, CloudStreamSource } from '@/services/cloudstream';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CloudStreamSourceCard from './CloudStreamSourceCard';

interface CloudStreamFilterSectionProps {
  selectedSources: string[];
  toggleSource: (name: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  categories: string[];
  groupedSources: Record<string, CloudStreamSource[]>;
  isLoading: boolean;
}

const CloudStreamFilterSection = ({
  selectedSources,
  toggleSource,
  applyFilters,
  clearFilters,
  categories,
  groupedSources,
  isLoading
}: CloudStreamFilterSectionProps) => {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <h4 className="mb-4 text-sm font-medium">Filter by Source</h4>
      <Tabs defaultValue={categories[0]}>
        <TabsList className="mb-4 grid w-full auto-cols-max grid-flow-col gap-2 overflow-x-auto">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize whitespace-nowrap">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {groupedSources[category].map(source => (
                <CloudStreamSourceCard 
                  key={source.name} 
                  source={source} 
                  isSelected={selectedSources.includes(source.name)}
                  onToggle={toggleSource}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-4 flex justify-between">
        {selectedSources.length > 0 && (
          <Button 
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        )}
        <Button 
          variant="default"
          size="sm"
          onClick={applyFilters}
          disabled={isLoading}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default CloudStreamFilterSection;
