
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { YarnItem } from "@/types/yarn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getColorCode } from "@/utils/color-utils";
import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useYarn } from "@/contexts/yarn-context";

interface TableViewProps {
  data: YarnItem[];
}

type SortField = 'brand' | 'subBrand' | 'length' | 'weight' | 'multicolor' | 'rows';
type SortDirection = 'asc' | 'desc' | null;

export function TableView({ data }: TableViewProps) {
  const { updateYarnItem } = useYarn();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
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
            <TableHead className="text-right">
              Quantity
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
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow key={item.id} className="page-transition animate-in" style={{ animationDelay: `${index * 20}ms` }}>
              <TableCell className="font-medium">{item.brand}</TableCell>
              <TableCell>{item.subBrand}</TableCell>
              <TableCell className="text-right">
                {editingItem === item.id ? (
                  <Input
                    type="number"
                    value={editValues.length}
                    onChange={(e) => handleInputChange('length', e.target.value)}
                    className="w-20 h-8 text-right inline-block"
                    min="0"
                  />
                ) : (
                  item.length
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingItem === item.id ? (
                  <Input
                    type="number"
                    value={editValues.qty}
                    onChange={(e) => handleInputChange('qty', e.target.value)}
                    className="w-20 h-8 text-right inline-block"
                    min="0"
                  />
                ) : (
                  item.qty
                )}
              </TableCell>
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
              <TableCell>
                {editingItem === item.id ? (
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      onClick={() => saveEditing(item.id)}
                      title="Save"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      onClick={cancelEditing}
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={() => startEditing(item)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
