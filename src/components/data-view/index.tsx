
import React, { useState } from "react";
import { useYarn } from "@/contexts/yarn-context";
import { YarnItem } from "@/types/yarn";
import { TableView } from "@/components/table-view";
import { GridView } from "@/components/grid-view";
import { LoadingState } from "./loading-state";
import { EmptyState } from "./empty-state";
import { ViewSelector } from "./view-selector";
import { LoadMoreButton } from "./load-more-button";

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
    return <LoadingState />;
  }
  
  if (filteredData.length === 0) {
    return <EmptyState />;
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
        
        <ViewSelector onViewChange={setViewMode} />
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'table' ? (
          <TableView data={visibleData} />
        ) : (
          <GridView data={visibleData} />
        )}
        
        <LoadMoreButton 
          onClick={loadMore} 
          remainingCount={filteredData.length - visibleCount} 
          visible={hasMore} 
        />
      </div>
    </div>
  );
}
