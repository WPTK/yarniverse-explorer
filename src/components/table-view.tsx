
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { YarnItem } from "@/types/yarn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getColorCode } from "@/utils/color-utils";

interface TableViewProps {
  data: YarnItem[];
}

export function TableView({ data }: TableViewProps) {
  return (
    <ScrollArea className="h-full w-full custom-scrollbar">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>Brand</TableHead>
            <TableHead>Sub-Brand</TableHead>
            <TableHead className="text-right">Length (yards)</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead className="text-center">Multicolor</TableHead>
            <TableHead className="text-right">Rows</TableHead>
            <TableHead>Colors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id} className="page-transition animate-in" style={{ animationDelay: `${index * 20}ms` }}>
              <TableCell className="font-medium">{item.brand}</TableCell>
              <TableCell>{item.subBrand}</TableCell>
              <TableCell className="text-right">{item.length}</TableCell>
              <TableCell className="capitalize">{item.weight}</TableCell>
              <TableCell className="text-center">
                {item.multicolor ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-right">{item.rows}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {item.colors.map((color, i) => (
                    <span
                      key={`${item.id}-color-${i}`}
                      className="color-pill" 
                      style={{ backgroundColor: getColorCode(color) }}
                      title={color}
                    />
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
