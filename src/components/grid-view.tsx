
import { YarnItem } from "@/types/yarn";
import { getColorCode } from "@/utils/color-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface GridViewProps {
  data: YarnItem[];
}

export function GridView({ data }: GridViewProps) {
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
                <p className="font-medium">{item.length} yards</p>
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
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
