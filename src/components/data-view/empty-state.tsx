
import React from 'react';

export const EmptyState = () => {
  return (
    <div className="p-4 rounded-lg glass-card h-full flex flex-col items-center justify-center">
      <p className="text-muted-foreground">No matching yarn found.</p>
      <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
    </div>
  );
};
