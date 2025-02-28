
import { useState } from "react";
import { useYarn } from "@/contexts/yarn-context";
import { YarnItem } from "@/types/yarn";
import { Button } from "@/components/ui/button";
import { TableView } from "@/components/table-view";
import { GridView } from "@/components/grid-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, List } from "lucide-react";

export function DataView() {
  const { filteredData, isLoading } = useYarn();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [visibleCount, setVisibleCount] = useState(50);
  
  // Get visible subset of data for infinite scroll
  const visibleData = filteredData.slice(0, visibleCount);
  
  // Handle loading more items (infinite scroll)
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 50, filteredData.length));
  };
  
  // Check if we've reached the end of the data
  const hasMore = visibleCount < filteredData.length;
  
  if (isLoading) {
    return (
      <div className="p-4 rounded-lg glass-card h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading yarn collection...</p>
      </div>
    );
  }
  
  if (filteredData.length === 0) {
    return (
      <div className="p-4 rounded-lg glass-card h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No matching yarn found.</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 rounded-lg glass-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Yarn Collection 
          <span className="ml-2 text-sm text-muted-foreground">
            ({filteredData.length} items)
          </span>
        </h2>
        
        <Tabs defaultValue="table" onValueChange={(v) => setViewMode(v as 'table' | 'grid')}>
          <TabsList className="grid w-[120px] grid-cols-2">
            <TabsTrigger value="table" className="flex items-center justify-center">
              <List className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="grid" className="flex items-center justify-center">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'table' ? (
          <TableView data={visibleData} />
        ) : (
          <GridView data={visibleData} />
        )}
        
        {hasMore && (
          <div className="py-4 flex justify-center">
            <Button variant="outline" onClick={loadMore}>
              Load More ({filteredData.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
