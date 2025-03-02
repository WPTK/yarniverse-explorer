
import React from 'react';

export const LoadingState = () => {
  return (
    <div className="p-4 rounded-lg glass-card h-full flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <p className="mt-4 text-muted-foreground">Loading yarn collection...</p>
    </div>
  );
};
