
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, List } from "lucide-react";

interface ViewSelectorProps {
  onViewChange: (view: 'table' | 'grid') => void;
}

export const ViewSelector = ({ onViewChange }: ViewSelectorProps) => {
  return (
    <Tabs defaultValue="table" onValueChange={(v) => onViewChange(v as 'table' | 'grid')}>
      <TabsList className="grid w-[120px] grid-cols-2">
        <TabsTrigger value="table" className="flex items-center justify-center">
          <List className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="grid" className="flex items-center justify-center">
          <Grid className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
