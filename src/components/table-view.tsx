
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { YarnItem } from "@/types/yarn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getColorCode } from "@/utils/color-utils";
import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableViewProps {
  data: YarnItem[];
}

type SortField = 'brand' | 'subBrand' | 'length' | 'weight' | 'multicolor' | 'rows';
type SortDirection = 'asc' | 'desc' | null;

export function TableView({ data }: TableViewProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle sorting when a header is clicked
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If already sorting by this field, cycle through directions: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // If sorting by a new field, start with ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="ml-1 h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="ml-1 h-4 w-4" />;
    return <ArrowUpDown className="ml-1 h-4 w-4" />;
  };

  // Sort data based on current sort settings
  const sortedData = [...data].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let valueA, valueB;
    
    switch (sortField) {
      case 'brand':
        valueA = a.brand.toLowerCase();
        valueB = b.brand.toLowerCase();
        break;
      case 'subBrand':
        valueA = a.subBrand.toLowerCase();
        valueB = b.subBrand.toLowerCase();
        break;
      case 'length':
        valueA = a.length;
        valueB = b.length;
        break;
      case 'weight':
        valueA = a.weight.toLowerCase();
        valueB = b.weight.toLowerCase();
        break;
      case 'multicolor':
        valueA = a.multicolor ? 1 : 0;
        valueB = b.multicolor ? 1 : 0;
        break;
      case 'rows':
        valueA = a.rows;
        valueB = b.rows;
        break;
      default:
        return 0;
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <ScrollArea className="h-full w-full custom-scrollbar">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                className="p-0 h-auto font-medium hover:bg-transparent hover:text-primary flex items-center"
                onClick={() => handleSort('brand')}
              >
                Brand {getSortIcon('brand')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="p-0 h-auto font-medium hover:bg-transparent hover:text-primary flex items-center"
                onClick={() => handleSort('subBrand')}
              >
                Sub-Brand {getSortIcon('subBrand')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                className="p-0 h-auto font-medium hover:bg-transparent hover:text-primary flex items-center justify-end"
                onClick={() => handleSort('length')}
              >
                Length (yards) {getSortIcon('length')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="p-0 h-auto font-medium hover:bg-transparent hover:text-primary flex items-center"
                onClick={() => handleSort('weight')}
              >
                Weight {getSortIcon('weight')}
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                className="p-0 h-auto font-medium hover:bg-transparent hover:text-primary flex items-center justify-center"
                onClick={() => handleSort('multicolor')}
              >
                Multicolor {getSortIcon('multicolor')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                className="p-0 h-auto font-medium hover:bg-transparent hover:text-primary flex items-center justify-end"
                onClick={() => handleSort('rows')}
              >
                Rows {getSortIcon('rows')}
              </Button>
            </TableHead>
            <TableHead>Colors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
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
