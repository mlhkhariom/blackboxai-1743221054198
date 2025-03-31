
import { CloudStreamSource } from '@/services/cloudstream';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CloudStreamSourceCardProps {
  source: CloudStreamSource;
  isSelected: boolean;
  onToggle: (name: string) => void;
}

const CloudStreamSourceCard = ({ source, isSelected, onToggle }: CloudStreamSourceCardProps) => {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-moviemate-card/40 backdrop-blur-sm">
      <Checkbox 
        id={`source-${source.name}`} 
        checked={isSelected}
        onCheckedChange={() => onToggle(source.name)}
      />
      <div className="flex-1">
        <Label 
          htmlFor={`source-${source.name}`} 
          className="font-medium"
        >
          {source.name}
        </Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {source.language && (
            <div className="text-xs text-gray-400 bg-moviemate-card/50 px-2 py-0.5 rounded-full">
              {source.language.toUpperCase()}
            </div>
          )}
          {source.repo && (
            <div className="text-xs text-gray-400 bg-moviemate-card/50 px-2 py-0.5 rounded-full">
              {source.repo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudStreamSourceCard;
