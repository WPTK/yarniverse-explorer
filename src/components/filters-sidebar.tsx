
import { useState, useEffect } from "react";
import { useYarn } from "@/contexts/yarn-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { YarnWeight } from "@/types/yarn";
import { getColorCode, getAllColorGroups } from "@/utils/color-utils";
import { FilterX, Search, ChevronDown, ChevronUp } from "lucide-react";

export function FiltersSidebar() {
  const { 
    data, 
    filters, 
    setFilters, 
    resetFilters
  } = useYarn();
  
  const [uniqueBrands, setUniqueBrands] = useState<string[]>([]);
  const [uniqueSubBrands, setUniqueSubBrands] = useState<string[]>([]);
  const [uniqueWeights, setUniqueWeights] = useState<YarnWeight[]>([]);
  const [lengthRange, setLengthRange] = useState<[number, number]>([0, 0]);
  const [rowsRange, setRowsRange] = useState<[number, number]>([0, 0]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const colorGroups = getAllColorGroups();
  
  // Number of brands to show initially
  const INITIAL_BRANDS_SHOWN = 5;
  
  // Extract unique values from data
  useEffect(() => {
    if (data.length === 0) return;
    
    // Get unique brands
    const brands = Array.from(new Set(data.map(item => item.brand))).filter(Boolean).sort();
    setUniqueBrands(brands);
    
    // Get unique sub-brands
    const subBrands = Array.from(new Set(data.map(item => item.subBrand))).filter(Boolean).sort();
    setUniqueSubBrands(subBrands);
    
    // Get unique weights
    const weights = Array.from(new Set(data.map(item => item.weight))) as YarnWeight[];
    setUniqueWeights(weights.filter(Boolean).sort());
    
    // Get min/max length
    const lengths = data.map(item => item.length);
    setLengthRange([
      Math.min(...lengths),
      Math.max(...lengths)
    ]);
    
    // Get min/max rows
    const rows = data.map(item => item.rows);
    setRowsRange([
      Math.min(...rows),
      Math.max(...rows)
    ]);
  }, [data]);
  
  // Handle checkbox changes for filter arrays
  const handleArrayFilterChange = (
    key: 'brands' | 'subBrands' | 'weights' | 'colorGroups',
    value: string,
    checked: boolean
  ) => {
    setFilters({
      ...filters,
      [key]: checked 
        ? [...filters[key], value]
        : filters[key].filter(item => item !== value)
    });
  };
  
  // Handle multicolor toggle
  const handleMulticolorChange = (value: boolean | null) => {
    setFilters({
      ...filters,
      multicolor: value
    });
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };
  
  // Handle length range
  const handleLengthChange = (value: number[]) => {
    setFilters({
      ...filters,
      minLength: value[0] === lengthRange[0] ? null : value[0],
      maxLength: value[0] === lengthRange[1] ? null : value[0]
    });
  };
  
  // Handle rows range
  const handleRowsChange = (value: number[]) => {
    setFilters({
      ...filters,
      minRows: value[0] === rowsRange[0] ? null : value[0],
      maxRows: value[0] === rowsRange[1] ? null : value[0]
    });
  };
  
  // Toggle showing all brands
  const toggleShowAllBrands = () => {
    setShowAllBrands(!showAllBrands);
  };
  
  // Get the brands to display based on the showAllBrands state
  const displayedBrands = showAllBrands 
    ? uniqueBrands 
    : uniqueBrands.slice(0, INITIAL_BRANDS_SHOWN);
  
  return (
    <div className="p-4 rounded-lg glass-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-xs h-8"
        >
          <FilterX className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={filters.search}
          onChange={handleSearchChange}
          className="pl-8"
        />
      </div>
      
      <ScrollArea className="flex-1 pr-3 overflow-y-auto">
        {/* Brands section */}
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium">Brands</h3>
          <div className="space-y-1 ml-1">
            {displayedBrands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => 
                    handleArrayFilterChange('brands', brand, checked as boolean)
                  }
                />
                <Label htmlFor={`brand-${brand}`} className="text-sm">
                  {brand}
                </Label>
              </div>
            ))}
            
            {uniqueBrands.length > INITIAL_BRANDS_SHOWN && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleShowAllBrands}
                className="text-xs mt-1 w-full flex items-center justify-center"
              >
                {showAllBrands ? (
                  <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                ) : (
                  <>Show More ({uniqueBrands.length - INITIAL_BRANDS_SHOWN} more) <ChevronDown className="ml-1 h-3 w-3" /></>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Weights section */}
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium">Weights</h3>
          <div className="space-y-1 ml-1">
            {uniqueWeights.map(weight => (
              <div key={weight} className="flex items-center space-x-2">
                <Checkbox
                  id={`weight-${weight}`}
                  checked={filters.weights.includes(weight)}
                  onCheckedChange={(checked) => 
                    handleArrayFilterChange('weights', weight, checked as boolean)
                  }
                />
                <Label htmlFor={`weight-${weight}`} className="text-sm capitalize">
                  {weight}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Multicolor section */}
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium">Multicolor</h3>
          <div className="space-y-1 ml-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="multicolor-yes"
                checked={filters.multicolor === true}
                onCheckedChange={(checked) => 
                  handleMulticolorChange(checked ? true : null)
                }
              />
              <Label htmlFor="multicolor-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="multicolor-no"
                checked={filters.multicolor === false}
                onCheckedChange={(checked) => 
                  handleMulticolorChange(checked ? false : null)
                }
              />
              <Label htmlFor="multicolor-no" className="text-sm">No</Label>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Color groups section */}
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium">Color Groups</h3>
          <div className="space-y-1 ml-1">
            {colorGroups.map(group => (
              <div key={group.name} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${group.name}`}
                  checked={filters.colorGroups.includes(group.name)}
                  onCheckedChange={(checked) => 
                    handleArrayFilterChange('colorGroups', group.name, checked as boolean)
                  }
                />
                <div className="flex items-center space-x-2">
                  <span 
                    className="inline-block w-4 h-4 rounded-full" 
                    style={{ backgroundColor: `hsl(${group.hue}, 70%, 60%)` }}
                  />
                  <Label htmlFor={`color-${group.name}`} className="text-sm">
                    {group.name}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Length range section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Length (yards)</h3>
            <span className="text-xs text-muted-foreground">
              {filters.minLength ?? lengthRange[0]} - {filters.maxLength ?? lengthRange[1]}
            </span>
          </div>
          <Slider
            defaultValue={[lengthRange[0]]}
            min={lengthRange[0]}
            max={lengthRange[1]}
            step={10}
            onValueChange={handleLengthChange}
          />
        </div>
        
        <Separator className="my-4" />
        
        {/* Rows range section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Rows</h3>
            <span className="text-xs text-muted-foreground">
              {filters.minRows ?? rowsRange[0]} - {filters.maxRows ?? rowsRange[1]}
            </span>
          </div>
          <Slider
            defaultValue={[rowsRange[0]]}
            min={rowsRange[0]}
            max={rowsRange[1]}
            step={1}
            onValueChange={handleRowsChange}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
