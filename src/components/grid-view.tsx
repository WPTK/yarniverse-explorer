
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
  
  // Handle editing
  const startEditing = (item: YarnItem) => {
    setEditingItem(item.id);
    setEditValues({ length: item.length, qty: item.qty });
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const saveEditing = (id: string) => {
    updateYarnItem(id, {
      length: editValues.length,
      qty: editValues.qty
    });
    setEditingItem(null);
  };

  const handleInputChange = (field: 'length' | 'qty', value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setEditValues(prev => ({
      ...prev,
      [field]: numValue
    }));
  };
  
  return (
    <ScrollArea className="h-full w-full custom-scrollbar">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
        {data.map((item, index) => (
          <div 
            key={item.id} 
            className="grid-card animate-in"
            style={{ animationDelay: `${index * 20}ms` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{item.brand}</h3>
                <p className="text-sm text-muted-foreground">{item.subBrand}</p>
              </div>
              <Badge variant={item.multicolor ? "default" : "outline"} className="ml-2">
                {item.multicolor ? "Multicolor" : "Solid"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Length</p>
                {editingItem === item.id ? (
                  <Input
                    type="number"
                    value={editValues.length}
                    onChange={(e) => handleInputChange('length', e.target.value)}
                    className="w-full h-8 mt-1"
                    min="0"
                  />
                ) : (
                  <p className="font-medium">{item.length} yards</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Quantity</p>
                {editingItem === item.id ? (
                  <Input
                    type="number"
                    value={editValues.qty}
                    onChange={(e) => handleInputChange('qty', e.target.value)}
                    className="w-full h-8 mt-1"
                    min="0"
                  />
                ) : (
                  <p className="font-medium">{item.qty}</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Weight</p>
                <p className="font-medium capitalize">{item.weight}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rows</p>
                <p className="font-medium">{item.rows}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-muted-foreground text-sm mb-2">Colors</p>
              <div className="flex gap-2">
                {item.colors.map((color, i) => (
                  <div
                    key={`${item.id}-color-${i}`}
                    className="relative group"
                  >
                    <div
                      className="color-pill w-8 h-8"
                      style={{ backgroundColor: getColorCode(color) }}
                    />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {color}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              {editingItem === item.id ? (
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8"
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
