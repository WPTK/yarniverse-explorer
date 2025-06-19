
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Edit2, Plus, Trash2, X, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useYarn } from '@/contexts/yarn-context';
import { YarnItem } from '@/types/yarn';

interface QuickScanReviewProps {
  sessionData: {
    items: Array<{
      upc: string;
      timestamp: Date;
      isNew: boolean;
      existingItem?: YarnItem;
      lookupData?: any;
    }>;
    newItemsCount: number;
    updatedItemsCount: number;
    totalScans: number;
  };
  onComplete: () => void;
  onClose: () => void;
}

export function QuickScanReview({ sessionData, onComplete, onClose }: QuickScanReviewProps) {
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionTags, setSessionTags] = useState('');
  const [editingItems, setEditingItems] = useState<Record<string, Partial<YarnItem>>>({});
  const [deletedItems, setDeletedItems] = useState<Set<string>>(new Set());
  
  const { updateYarnItem } = useYarn();
  const { toast } = useToast();

  const newItems = sessionData.items.filter(item => item.isNew && !deletedItems.has(item.upc));
  const updatedItems = sessionData.items.filter(item => !item.isNew && !deletedItems.has(item.upc));

  const handleEditItem = (upc: string, field: keyof YarnItem, value: any) => {
    setEditingItems(prev => ({
      ...prev,
      [upc]: {
        ...prev[upc],
        [field]: value,
      }
    }));
  };

  const handleDeleteItem = (upc: string) => {
    setDeletedItems(prev => new Set([...prev, upc]));
  };

  const handleRestoreItem = (upc: string) => {
    setDeletedItems(prev => {
      const updated = new Set(prev);
      updated.delete(upc);
      return updated;
    });
  };

  const handleSaveSession = () => {
    // Save new items to database
    newItems.forEach(item => {
      const editedData = editingItems[item.upc] || {};
      const yarnData = item.lookupData?.data || {};
      
      const newYarnItem: YarnItem = {
        id: `yarn-${Date.now()}-${item.upc}`,
        brand: editedData.brand || yarnData.brand || 'Unknown',
        subBrand: editedData.subBrand || yarnData.subBrand || '',
        vintage: editedData.vintage || yarnData.vintage || false,
        qty: editedData.qty || 1,
        length: editedData.length || yarnData.length || 0,
        multicolor: editedData.multicolor || yarnData.multicolor || false,
        softnessRanking: editedData.softnessRanking || yarnData.softnessRanking || '',
        weight: editedData.weight || yarnData.weight || 'medium',
        hookSize: editedData.hookSize || yarnData.hookSize || '',
        rows: editedData.rows || yarnData.rows || 0,
        machineWash: editedData.machineWash || yarnData.machineWash || false,
        machineDry: editedData.machineDry || yarnData.machineDry || false,
        material: editedData.material || yarnData.material || 'Mixed',
        brandColor: editedData.brandColor || yarnData.brandColor || '',
        colors: editedData.colors || yarnData.colors || [],
      };

      updateYarnItem(newYarnItem.id, newYarnItem);
    });

    toast({
      title: "Session Completed",
      description: `Added ${newItems.length} new items and updated ${updatedItems.length} existing items.`,
    });

    onComplete();
  };

  const getItemPreview = (item: any) => {
    const editedData = editingItems[item.upc] || {};
    const sourceData = item.lookupData?.data || {};
    
    return {
      brand: editedData.brand || sourceData.brand || 'Unknown Brand',
      color: editedData.brandColor || sourceData.brandColor || 'Unknown Color',
      weight: editedData.weight || sourceData.weight || 'Unknown Weight',
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quick Scan Session Review</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{sessionData.totalScans}</div>
              <div className="text-sm text-blue-600">Total Scans</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{sessionData.updatedItemsCount}</div>
              <div className="text-sm text-green-600">Items Updated</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{newItems.length}</div>
              <div className="text-sm text-orange-600">New Items to Add</div>
            </div>
          </div>

          {/* Session Notes */}
          <div className="space-y-2">
            <Label>Session Notes (Optional)</Label>
            <Textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Add notes about this scanning session (e.g., 'Purchased at Michaels', 'Inventory count')"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <Input
              value={sessionTags}
              onChange={(e) => setSessionTags(e.target.value)}
              placeholder="Comma-separated tags (e.g., 'michaels, sale, winter-2024')"
            />
          </div>

          <Separator />

          {/* Updated Items */}
          {updatedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Updated Items ({updatedItems.length})
              </h3>
              <div className="space-y-2">
                {updatedItems.map((item) => (
                  <div key={item.upc} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.existingItem?.brand} - {item.existingItem?.brandColor}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: {(item.existingItem?.qty || 1) - 1} → {item.existingItem?.qty || 1}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-700">
                      Updated
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Items */}
          {newItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-orange-600" />
                New Items ({newItems.length})
              </h3>
              <div className="space-y-4">
                {newItems.map((item) => {
                  const preview = getItemPreview(item);
                  const isEditing = !!editingItems[item.upc];
                  
                  return (
                    <div key={item.upc} className="border rounded-lg p-4 bg-orange-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium">UPC: {item.upc}</div>
                          <div className="text-sm text-gray-600">
                            {preview.brand} • {preview.color} • {preview.weight}
                          </div>
                          {item.lookupData && (
                            <Badge variant="secondary" className="mt-1">
                              {Math.round(item.lookupData.confidence * 100)}% confidence
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (isEditing) {
                                setEditingItems(prev => {
                                  const updated = { ...prev };
                                  delete updated[item.upc];
                                  return updated;
                                });
                              } else {
                                setEditingItems(prev => ({
                                  ...prev,
                                  [item.upc]: item.lookupData?.data || {}
                                }));
                              }
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteItem(item.upc)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <Label className="text-xs">Brand</Label>
                            <Input
                              size="sm"
                              value={editingItems[item.upc]?.brand || ''}
                              onChange={(e) => handleEditItem(item.upc, 'brand', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Color</Label>
                            <Input
                              size="sm"
                              value={editingItems[item.upc]?.brandColor || ''}
                              onChange={(e) => handleEditItem(item.upc, 'brandColor', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Weight</Label>
                            <Input
                              size="sm"
                              value={editingItems[item.upc]?.weight || ''}
                              onChange={(e) => handleEditItem(item.upc, 'weight', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              size="sm"
                              type="number"
                              value={editingItems[item.upc]?.qty || 1}
                              onChange={(e) => handleEditItem(item.upc, 'qty', parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deleted Items */}
          {deletedItems.size > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600">
                Deleted Items ({deletedItems.size})
              </h3>
              <div className="space-y-2">
                {Array.from(deletedItems).map((upc) => {
                  const item = sessionData.items.find(i => i.upc === upc);
                  if (!item) return null;
                  
                  return (
                    <div key={upc} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium line-through text-red-600">UPC: {upc}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreItem(upc)}
                      >
                        Restore
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSaveSession} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Session
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
