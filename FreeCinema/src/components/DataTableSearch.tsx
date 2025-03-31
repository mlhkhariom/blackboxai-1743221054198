
import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Channel } from '../services/iptv';

interface DataTableSearchProps {
  data: Channel[];
  onFilter: (filtered: Channel[]) => void;
}

const DataTableSearch = ({ data, onFilter }: DataTableSearchProps) => {
    const [input, setInput] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const allCategories = Array.from(new Set(data.flatMap(channel => channel.categories))).sort();

    useEffect(() => {
        const filtered = data.filter((channel) => {
            const matchesSearch = channel.name.toLowerCase().includes(input.toLowerCase());
            const matchesCategories = selectedCategories.length === 0 || 
                channel.categories.some(cat => selectedCategories.includes(cat));
            
            return matchesSearch && matchesCategories;
        });
        
        onFilter(filtered);
    }, [input, selectedCategories, data, onFilter]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                        className="pl-8"
                        placeholder="Search channels..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="mr-2 h-4 w-4" />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
            </div>

            {showFilters && (
                <div className="rounded-md border border-border bg-card p-4">
                    <h4 className="mb-2 text-sm font-medium">Filter by Category</h4>
                    <div className="flex flex-wrap gap-2">
                        {allCategories.map(category => (
                            <div key={category} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`category-${category}`} 
                                    checked={selectedCategories.includes(category)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedCategories(prev => [...prev, category]);
                                        } else {
                                            setSelectedCategories(prev => prev.filter(c => c !== category));
                                        }
                                    }}
                                />
                                <Label htmlFor={`category-${category}`}>{category}</Label>
                            </div>
                        ))}
                    </div>
                    {selectedCategories.length > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setSelectedCategories([])}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataTableSearch;
