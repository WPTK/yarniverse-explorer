
/**
 * Grid View Component
 * 
 * Displays yarn items in a responsive grid layout with editing capabilities.
 * Includes color previews, yarn details, and editing interface.
 */

import { useState } from "react";
import { YarnItem } from "@/types/yarn";
import { getColorCode } from "@/utils/color-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X } from "lucide-react";
import { useYarn } from "@/contexts/yarn-context";

interface GridViewProps {
  data: YarnItem[];
}

export function GridView({ data }: GridViewProps) {
  const { updateYarnItem } = useYarn();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{length: number, qty: number}>({ length: 0, qty: 0 });
  
  /**
   * Initiates editing mode for a yarn item
   */
  const startEditing = (item: YarnItem) => {
    setEditingItem(item.id);
    setEditValues({ length: item.length, qty: item.qty });
  };

  /**
   * Cancels editing and resets the editing state
   */
  const cancelEditing = () => {
    setEditingItem(null);
  };

  /**
   * Saves the edited values back to the yarn item
   */
  const saveEditing = (id: string) => {
    updateYarnItem(id, {
      length: editValues.length,
      qty: editValues.qty
    });
    setEditingItem(null);
  };

  /**
   * Handles changes to input fields during editing
   */
  const handleInputChange = (field: 'length' | 'qty', value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setEditValues(prev => ({
      ...prev,
      [field]: numValue
    }));
  };
  
  /**
   * Renders the color pills for a yarn item
   */
  const renderColorPills = (item: YarnItem) => (
    <div className="flex gap-2">
      {item.colors.map((color, i) => (
        <div key={`${item.id}-color-${i}`} className="relative group">
          <div
            className="color-pill w-8 h-8 rounded-full border border-border shadow-sm transition-transform hover:scale-110"
            style={{ backgroundColor: getColorCode(color) }}
          />
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
            {color}
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <ScrollArea className="h-full w-full custom-scrollbar">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
        {data.map((item, index) => (
          <div 
            key={item.id} 
            className="grid-card animate-in bg-card p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-all"
            style={{ animationDelay: `${index * 20}ms` }}
          >
            {/* Header with brand and multicolor badge */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-lg">{item.brand}</h3>
                <p className="text-sm text-muted-foreground">{item.subBrand}</p>
              </div>
              <Badge 
                variant={item.multicolor ? "default" : "outline"} 
                className={`ml-2 ${item.multicolor ? 'bg-primary/90 hover:bg-primary' : ''}`}
              >
                {item.multicolor ? "Multicolor" : "Solid"}
              </Badge>
            </div>
            
            {/* Main information grid */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              {/* Length field - editable */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Length</p>
                {editingItem === item.id ? (
                  <Input
                    type="number"
                    value={editValues.length}
                    onChange={(e) => handleInputChange('length', e.target.value)}
                    className="w-full h-8 mt-1 text-sm"
                    min="0"
                  />
                ) : (
                  <p className="font-medium">{item.length} yards</p>
                )}
              </div>
              
              {/* Quantity field - editable */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Quantity</p>
                {editingItem === item.id ? (
                  <Input
                    type="number"
                    value={editValues.qty}
                    onChange={(e) => handleInputChange('qty', e.target.value)}
                    className="w-full h-8 mt-1 text-sm"
                    min="0"
                  />
                ) : (
                  <p className="font-medium">{item.qty}</p>
                )}
              </div>
              
              {/* Weight field - readonly */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Weight</p>
                <p className="font-medium capitalize">{item.weight}</p>
              </div>
              
              {/* Rows field - readonly */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Rows</p>
                <p className="font-medium">{item.rows}</p>
              </div>
            </div>
            
            {/* Colors section */}
            <div className="mt-4">
              <p className="text-xs text-muted-foreground font-medium mb-2">Colors</p>
              {renderColorPills(item)}
            </div>
            
            {/* Actions section */}
            <div className="mt-4 flex justify-end">
              {editingItem === item.id ? (
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 bg-primary/10 hover:bg-primary/20 border-primary/20"
                    onClick={() => saveEditing(item.id)}
                  >
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8"
                    onClick={cancelEditing}
                  >
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8"
                  onClick={() => startEditing(item)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
