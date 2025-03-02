
import React from 'react';
import { Button } from "@/components/ui/button";

interface LoadMoreButtonProps {
  onClick: () => void;
  remainingCount: number;
  visible: boolean;
}

export const LoadMoreButton = ({ onClick, remainingCount, visible }: LoadMoreButtonProps) => {
  if (!visible) return null;
  
  return (
    <div className="py-4 flex justify-center">
      <Button variant="outline" onClick={onClick}>
        Load More ({remainingCount} remaining)
      </Button>
    </div>
  );
};
