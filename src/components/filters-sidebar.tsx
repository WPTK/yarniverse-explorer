
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
  const [uniqueMaterials, setUniqueMaterials] = useState<string[]>([]);
  const [uniqueHookSizes, setUniqueHookSizes] = useState<string[]>([]);
  const [uniqueSoftnessRankings, setUniqueSoftnessRankings] = useState<string[]>([]); // New state for softness rankings
  const [lengthRange, setLengthRange] = useState<[number, number]>([0, 0]);
  const [qtyRange, setQtyRange] = useState<[number, number]>([0, 0]);
  const [rowsRange, setRowsRange] = useState<[number, number]>([0, 0]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllSubBrands, setShowAllSubBrands] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [showAllHookSizes, setShowAllHookSizes] = useState(false);
  const [showAllSoftnessRankings, setShowAllSoftnessRankings] = useState(false); // New state for showing all softness rankings
  const colorGroups = getAllColorGroups();
  
  const INITIAL_ITEMS_SHOWN = 5;
  
  useEffect(() => {
    if (data.length === 0) return;
    
    const brands = Array.from(new Set(data.map(item => item.brand))).filter(Boolean).sort();
    setUniqueBrands(brands);
    
    const subBrands = Array.from(new Set(data.map(item => item.subBrand))).filter(Boolean).sort();
    setUniqueSubBrands(subBrands);
    
    const weights = Array.from(new Set(data.map(item => item.weight))) as YarnWeight[];
    setUniqueWeights(weights.filter(Boolean).sort());
    
    const materials = Array.from(new Set(data.map(item => item.material))).filter(Boolean).sort();
    setUniqueMaterials(materials);
    
    const hookSizes = Array.from(new Set(data.map(item => item.hookSize))).filter(Boolean).sort();
    setUniqueHookSizes(hookSizes);
    
    // Get unique softness rankings
    const softnessRankings = Array.from(new Set(data.map(item => item.softnessRanking))).filter(Boolean).sort();
    setUniqueSoftnessRankings(softnessRankings);
    
    const lengths = data.map(item => item.length).filter(length => length !== undefined && length !== null);
    setLengthRange([
      Math.min(...(lengths.length ? lengths : [0])),
      Math.max(...(lengths.length ? lengths : [0]))
    ]);
    
    const quantities = data.map(item => item.qty).filter(qty => qty !== undefined && qty !== null);
    setQtyRange([
      Math.min(...(quantities.length ? quantities : [0])),
      Math.max(...(quantities.length ? quantities : [0]))
    ]);
    
    const rows = data.map(item => item.rows).filter(row => row !== undefined && row !== null);
    setRowsRange([
      Math.min(...(rows.length ? rows : [0])),
      Math.max(...(rows.length ? rows : [0]))
    ]);
  }, [data]);
  
  const handleArrayFilterChange = (
    key: 'brands' | 'subBrands' | 'weights' | 'colorGroups' | 'materials' | 'hookSizes' | 'softnessRankings',
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
  
  const handleBooleanChange = (
    key: 'multicolor' | 'vintage' | 'machineWash' | 'machineDry',
    value: boolean | null
  ) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };
  
  const handleRangeChange = (
    minKey: 'minLength' | 'minRows' | 'minQty',
    maxKey: 'maxLength' | 'maxRows' | 'maxQty',
    range: [number, number],
    value: number[]
  ) => {
    if (!value.length) return;
    
    setFilters({
      ...filters,
      [minKey]: value[0] === range[0] ? null : value[0],
      [maxKey]: value[0] === range[1] ? null : value[0]
    });
  };
  
  const toggleShowAll = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(prev => !prev);
  };
  
  const getDisplayedItems = <T,>(items: T[], showAll: boolean): T[] => {
    return showAll ? items : items.slice(0, INITIAL_ITEMS_SHOWN);
  };
  
  const displayedBrands = getDisplayedItems(uniqueBrands, showAllBrands);
  const displayedSubBrands = getDisplayedItems(uniqueSubBrands, showAllSubBrands);
  const displayedMaterials = getDisplayedItems(uniqueMaterials, showAllMaterials);
  const displayedHookSizes = getDisplayedItems(uniqueHookSizes, showAllHookSizes);
  const displayedSoftnessRankings = getDisplayedItems(uniqueSoftnessRankings, showAllSoftnessRankings);
  
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
            
            {uniqueBrands.length > INITIAL_ITEMS_SHOWN && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleShowAll(setShowAllBrands)}
                className="text-xs mt-1 w-full flex items-center justify-center"
              >
                {showAllBrands ? (
                  <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                ) : (
                  <>Show More ({uniqueBrands.length - INITIAL_ITEMS_SHOWN} more) <ChevronDown className="ml-1 h-3 w-3" /></>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium">Sub-brands</h3>
          <div className="space-y-1 ml-1">
            {displayedSubBrands.map(subBrand => (
              <div key={subBrand} className="flex items-center space-x-2">
                <Checkbox
                  id={`subBrand-${subBrand}`}
                  checked={filters.subBrands.includes(subBrand)}
                  onCheckedChange={(checked) => 
                    handleArrayFilterChange('subBrands', subBrand, checked as boolean)
                  }
                />
                <Label htmlFor={`subBrand-${subBrand}`} className="text-sm">
                  {subBrand}
                </Label>
              </div>
            ))}
            
            {uniqueSubBrands.length > INITIAL_ITEMS_SHOWN && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleShowAll(setShowAllSubBrands)}
                className="text-xs mt-1 w-full flex items-center justify-center"
              >
                {showAllSubBrands ? (
                  <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                ) : (
                  <>Show More ({uniqueSubBrands.length - INITIAL_ITEMS_SHOWN} more) <ChevronDown className="ml-1 h-3 w-3" /></>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
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
        
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium">Materials</h3>
          <div className="space-y-1 ml-1">
            {displayedMaterials.map(material => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={`material-${material}`}
                  checked={filters.materials.includes(material)}
                  onCheckedChange={(checked) => 
                    handleArrayFilterChange('materials', material, checked as boolean)
                  }
                />
                <Label htmlFor={`material-${material}`} className="text-sm">
                  {material}
                </Label>
              </div>
            ))}
            
            {uniqueMaterials.length > INITIAL_ITEMS_SHOWN && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleShowAll(setShowAllMaterials)}
                className="text-xs mt-1 w-full flex items-center justify-center"
              >
                {showAllMaterials ? (
                  <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                ) : (
                  <>Show More ({uniqueMaterials.length - INITIAL_ITEMS_SHOWN} more) <ChevronDown className="ml-1 h-3 w-3" /></>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium">Hook Sizes</h3>
          <div className="space-y-1 ml-1">
            {displayedHookSizes.map(hookSize => (
              <div key={hookSize} className="flex items-center space-x-2">
                <Checkbox
                  id={`hookSize-${hookSize}`}
                  checked={filters.hookSizes.includes(hookSize)}
                  onCheckedChange={(checked) => 
                    handleArrayFilterChange('hookSizes', hookSize, checked as boolean)
                  }
                />
                <Label htmlFor={`hookSize-${hookSize}`} className="text-sm">
                  {hookSize}
                </Label>
              </div>
            ))}
            
            {uniqueHookSizes.length > INITIAL_ITEMS_SHOWN && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleShowAll(setShowAllHookSizes)}
                className="text-xs mt-1 w-full flex items-center justify-center"
              >
                {showAllHookSizes ? (
                  <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                ) : (
                  <>Show More ({uniqueHookSizes.length - INITIAL_ITEMS_SHOWN} more) <ChevronDown className="ml-1 h-3 w-3" /></>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* New Softness Rankings filter section */}
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium">Softness Rankings</h3>
          <div className="space-y-1 ml-1">
            {displayedSoftnessRankings.map(ranking => (
              <div key={ranking} className="flex items-center space-x-2">
                <Checkbox
                  id={`softness-${ranking}`}
                  checked={filters.softnessRankings.includes(ranking)}
                  onCheckedChange={(checked) => 
                    handleArrayFilterChange('softnessRankings', ranking, checked as boolean)
                  }
                />
                <Label htmlFor={`softness-${ranking}`} className="text-sm">
                  {ranking}
                </Label>
              </div>
            ))}
            
            {uniqueSoftnessRankings.length > INITIAL_ITEMS_SHOWN && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleShowAll(setShowAllSoftnessRankings)}
                className="text-xs mt-1 w-full flex items-center justify-center"
              >
                {showAllSoftnessRankings ? (
                  <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                ) : (
                  <>Show More ({uniqueSoftnessRankings.length - INITIAL_ITEMS_SHOWN} more) <ChevronDown className="ml-1 h-3 w-3" /></>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Vintage</h3>
            <div className="space-y-1 ml-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vintage-yes"
                  checked={filters.vintage === true}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('vintage', checked ? true : null)
                  }
                />
                <Label htmlFor="vintage-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vintage-no"
                  checked={filters.vintage === false}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('vintage', checked ? false : null)
                  }
                />
                <Label htmlFor="vintage-no" className="text-sm">No</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Multicolor</h3>
            <div className="space-y-1 ml-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multicolor-yes"
                  checked={filters.multicolor === true}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('multicolor', checked ? true : null)
                  }
                />
                <Label htmlFor="multicolor-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multicolor-no"
                  checked={filters.multicolor === false}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('multicolor', checked ? false : null)
                  }
                />
                <Label htmlFor="multicolor-no" className="text-sm">No</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Machine Wash</h3>
            <div className="space-y-1 ml-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="machineWash-yes"
                  checked={filters.machineWash === true}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('machineWash', checked ? true : null)
                  }
                />
                <Label htmlFor="machineWash-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="machineWash-no"
                  checked={filters.machineWash === false}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('machineWash', checked ? false : null)
                  }
                />
                <Label htmlFor="machineWash-no" className="text-sm">No</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Machine Dry</h3>
            <div className="space-y-1 ml-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="machineDry-yes"
                  checked={filters.machineDry === true}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('machineDry', checked ? true : null)
                  }
                />
                <Label htmlFor="machineDry-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="machineDry-no"
                  checked={filters.machineDry === false}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('machineDry', checked ? false : null)
                  }
                />
                <Label htmlFor="machineDry-no" className="text-sm">No</Label>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
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
        
        <div className="space-y-6 mb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Length (yards)</h3>
              <span className="text-xs text-muted-foreground">
                {filters.minLength ?? lengthRange[0]} - {filters.maxLength ?? lengthRange[1]}
              </span>
            </div>
            <Slider
              value={[filters.minLength ?? lengthRange[0]]}
              min={lengthRange[0]}
              max={lengthRange[1]}
              step={10}
              onValueChange={(value) => handleRangeChange('minLength', 'maxLength', lengthRange, value)}
              className="mt-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Quantity</h3>
              <span className="text-xs text-muted-foreground">
                {filters.minQty ?? qtyRange[0]} - {filters.maxQty ?? qtyRange[1]}
              </span>
            </div>
            <Slider
              value={[filters.minQty ?? qtyRange[0]]}
              min={qtyRange[0]}
              max={qtyRange[1]}
              step={1}
              onValueChange={(value) => handleRangeChange('minQty', 'maxQty', qtyRange, value)}
              className="mt-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Rows</h3>
              <span className="text-xs text-muted-foreground">
                {filters.minRows ?? rowsRange[0]} - {filters.maxRows ?? rowsRange[1]}
              </span>
            </div>
            <Slider
              value={[filters.minRows ?? rowsRange[0]]}
              min={rowsRange[0]}
              max={rowsRange[1]}
              step={1}
              onValueChange={(value) => handleRangeChange('minRows', 'maxRows', rowsRange, value)}
              className="mt-2"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
