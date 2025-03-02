import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { YarnItem, FilterState, SavedView } from "@/types/yarn";
import CSVService from "@/services/csv-service";
import { useToast } from "@/hooks/use-toast";
import { getAllColorGroups } from "@/utils/color-utils";

interface YarnContextType {
  data: YarnItem[];
  isLoading: boolean;
  error: Error | null;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  resetFilters: () => void;
  filteredData: YarnItem[];
  savedViews: SavedView[];
  saveCurrentView: (name: string) => void;
  loadSavedView: (id: string) => void;
  deleteSavedView: (id: string) => void;
  csvService: CSVService;
}

// Updated default filter state with new fields
const defaultFilters: FilterState = {
  brands: [],
  subBrands: [],
  weights: [],
  materials: [],
  hookSizes: [],
  vintage: null,
  machineWash: null,
  machineDry: null,
  multicolor: null,
  colorGroups: [],
  minLength: null,
  maxLength: null,
  minQty: null,
  maxQty: null,
  minRows: null,
  maxRows: null,
  minSoftness: null,
  maxSoftness: null,
  search: "",
};

const YarnContext = createContext<YarnContextType | undefined>(undefined);

export function YarnProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<YarnItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const { toast } = useToast();
  
  // Initialize CSV service
  const csvService = useMemo(() => new CSVService(), []);

  // Get all color groups for filtering
  const allColorGroups = useMemo(() => getAllColorGroups(), []);

  // Load saved views from localStorage
  useEffect(() => {
    const savedViewsJson = localStorage.getItem('savedViews');
    if (savedViewsJson) {
      try {
        const parsed = JSON.parse(savedViewsJson);
        // Convert string dates back to Date objects
        const withDates = parsed.map((view: any) => ({
          ...view,
          createdAt: new Date(view.createdAt)
        }));
        setSavedViews(withDates);
      } catch (e) {
        console.error('Error loading saved views:', e);
      }
    }
  }, []);

  // Start polling for CSV data updates
  useEffect(() => {
    setIsLoading(true);
    
    const handleDataUpdate = (newData: YarnItem[]) => {
      setData(newData);
      setIsLoading(false);
      setError(null);
    };
    
    try {
      csvService.startPolling(handleDataUpdate);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
    
    return () => {
      csvService.stopPolling();
    };
  }, [csvService]);

  // Apply filters to get filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(item.brand)) {
        return false;
      }
      
      // Sub-brand filter
      if (filters.subBrands.length > 0 && !filters.subBrands.includes(item.subBrand)) {
        return false;
      }
      
      // Weight filter
      if (filters.weights.length > 0 && !filters.weights.includes(item.weight)) {
        return false;
      }
      
      // Materials filter
      if (filters.materials.length > 0 && !filters.materials.includes(item.material)) {
        return false;
      }
      
      // Hook Size filter
      if (filters.hookSizes.length > 0 && !filters.hookSizes.includes(item.hookSize)) {
        return false;
      }
      
      // Vintage filter
      if (filters.vintage !== null && item.vintage !== filters.vintage) {
        return false;
      }
      
      // Machine wash filter
      if (filters.machineWash !== null && item.machineWash !== filters.machineWash) {
        return false;
      }
      
      // Machine dry filter
      if (filters.machineDry !== null && item.machineDry !== filters.machineDry) {
        return false;
      }
      
      // Multicolor filter
      if (filters.multicolor !== null && item.multicolor !== filters.multicolor) {
        return false;
      }
      
      // Length range filter
      if (filters.minLength !== null && item.length < filters.minLength) {
        return false;
      }
      if (filters.maxLength !== null && item.length > filters.maxLength) {
        return false;
      }
      
      // Quantity range filter
      if (filters.minQty !== null && item.qty < filters.minQty) {
        return false;
      }
      if (filters.maxQty !== null && item.qty > filters.maxQty) {
        return false;
      }
      
      // Rows range filter
      if (filters.minRows !== null && item.rows < filters.minRows) {
        return false;
      }
      if (filters.maxRows !== null && item.rows > filters.maxRows) {
        return false;
      }
      
      // Softness ranking range filter
      if (filters.minSoftness !== null && item.softnessRanking < filters.minSoftness) {
        return false;
      }
      if (filters.maxSoftness !== null && item.softnessRanking > filters.maxSoftness) {
        return false;
      }
      
      // Search filter (updated to include all relevant fields)
      if (filters.search && filters.search.trim() !== '') {
        const searchLower = filters.search.toLowerCase();
        const searchMatch = 
          item.brand.toLowerCase().includes(searchLower) ||
          item.subBrand.toLowerCase().includes(searchLower) ||
          item.weight.toLowerCase().includes(searchLower) ||
          item.material.toLowerCase().includes(searchLower) ||
          item.brandColor.toLowerCase().includes(searchLower) ||
          item.hookSize.toLowerCase().includes(searchLower) ||
          item.colors.some(color => color.toLowerCase().includes(searchLower));
        
        if (!searchMatch) {
          return false;
        }
      }
      
      // Color group filter
      if (filters.colorGroups.length > 0) {
        // If any of the item's colors match any of the selected color groups
        const hasMatchingColor = item.colors.some(color => {
          // Check if this color belongs to any of the selected color groups
          return filters.colorGroups.some(groupName => {
            // Get the color group
            const group = allColorGroups.find(g => g.name === groupName);
            if (!group) return false;
            
            // Check if this color is in the group
            const lowerColor = color.toLowerCase().trim();
            return group.colors.some(groupColor => 
              lowerColor.includes(groupColor) || groupColor.includes(lowerColor)
            );
          });
        });
        
        if (!hasMatchingColor) {
          return false;
        }
      }
      
      // Passed all filters
      return true;
    });
  }, [data, filters, allColorGroups]);

  // Reset filters to default
  const resetFilters = () => {
    setFilters(defaultFilters);
    toast({
      title: "Filters reset",
      description: "All filters have been cleared.",
    });
  };

  // Save current view
  const saveCurrentView = (name: string) => {
    const newView: SavedView = {
      id: `view-${Date.now()}`,
      name,
      filters: { ...filters },
      createdAt: new Date(),
    };
    
    const updatedViews = [...savedViews, newView];
    setSavedViews(updatedViews);
    
    // Save to localStorage
    localStorage.setItem('savedViews', JSON.stringify(updatedViews));
    
    toast({
      title: "View saved",
      description: `"${name}" has been saved to your views.`,
    });
  };

  // Load a saved view
  const loadSavedView = (id: string) => {
    const view = savedViews.find(v => v.id === id);
    if (view) {
      setFilters(view.filters);
      toast({
        title: "View loaded",
        description: `"${view.name}" has been loaded.`,
      });
    }
  };

  // Delete a saved view
  const deleteSavedView = (id: string) => {
    const view = savedViews.find(v => v.id === id);
    const updatedViews = savedViews.filter(v => v.id !== id);
    setSavedViews(updatedViews);
    
    // Save to localStorage
    localStorage.setItem('savedViews', JSON.stringify(updatedViews));
    
    if (view) {
      toast({
        title: "View deleted",
        description: `"${view.name}" has been removed.`,
      });
    }
  };

  // Provide context value
  const value = {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    filteredData,
    savedViews,
    saveCurrentView,
    loadSavedView,
    deleteSavedView,
    csvService,
  };

  return <YarnContext.Provider value={value}>{children}</YarnContext.Provider>;
}

export function useYarn() {
  const context = useContext(YarnContext);
  if (context === undefined) {
    throw new Error("useYarn must be used within a YarnProvider");
  }
  return context;
}
