
import React, { useState } from 'react';
import { YarnItem } from '@/types/yarn';
import { UPCLookupResult } from '@/services/upc-lookup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScannedYarnFormProps {
  lookupResult: UPCLookupResult;
  onSave: (yarnItem: YarnItem) => void;
  onCancel: () => void;
}

export function ScannedYarnForm({ lookupResult, onSave, onCancel }: ScannedYarnFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<YarnItem>>({
    ...lookupResult.data,
    id: `yarn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  });

  const [fieldConfidence] = useState(() => {
    // Simulate field-level confidence scores
    const baseConfidence = lookupResult.confidence;
    return {
      brand: baseConfidence > 0.7 ? 'high' : 'medium',
      subBrand: 'low',
      weight: baseConfidence > 0.5 ? 'medium' : 'low',
      material: baseConfidence > 0.6 ? 'medium' : 'low',
      brandColor: baseConfidence > 0.4 ? 'medium' : 'low',
      length: 'low',
      qty: 'high',
    };
  });

  const handleInputChange = (field: keyof YarnItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.brand || !formData.weight) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in at least the brand and weight fields.",
        variant: "destructive",
      });
      return;
    }

    const yarnItem: YarnItem = {
      id: formData.id!,
      brand: formData.brand!,
      subBrand: formData.subBrand || '',
      vintage: formData.vintage || false,
      qty: formData.qty || 1,
      length: formData.length || 0,
      multicolor: formData.multicolor || false,
      softnessRanking: formData.softnessRanking || '',
      weight: formData.weight!,
      hookSize: formData.hookSize || '',
      rows: formData.rows || 0,
      machineWash: formData.machineWash || false,
      machineDry: formData.machineDry || false,
      material: formData.material || 'Mixed',
      brandColor: formData.brandColor || '',
      colors: formData.colors || [],
    };

    onSave(yarnItem);
    toast({
      title: "Yarn Added",
      description: "Scanned yarn has been added to your collection.",
    });
  };

  const getConfidenceBadge = (field: string) => {
    const confidence = fieldConfidence[field as keyof typeof fieldConfidence];
    const variants = {
      high: { variant: 'default' as const, icon: Check, color: 'text-green-600' },
      medium: { variant: 'secondary' as const, icon: AlertCircle, color: 'text-yellow-600' },
      low: { variant: 'outline' as const, icon: AlertCircle, color: 'text-red-600' },
    };
    
    const config = variants[confidence as keyof typeof variants] || variants.low;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="ml-2">
        <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
        {confidence}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <span>Review Scanned Yarn</span>
            <div className="text-sm font-normal text-gray-500 mt-1">
              UPC: {lookupResult.upc} • Confidence: {Math.round(lookupResult.confidence * 100)}%
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lookupResult.productImage && (
          <div className="flex justify-center">
            <img 
              src={lookupResult.productImage} 
              alt="Product" 
              className="h-32 object-contain rounded"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center">
              Brand *
              {getConfidenceBadge('brand')}
            </Label>
            <Input
              value={formData.brand || ''}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="Enter brand name"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              Sub-brand
              {getConfidenceBadge('subBrand')}
            </Label>
            <Input
              value={formData.subBrand || ''}
              onChange={(e) => handleInputChange('subBrand', e.target.value)}
              placeholder="Enter sub-brand"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              Weight *
              {getConfidenceBadge('weight')}
            </Label>
            <Select value={formData.weight} onValueChange={(value) => handleInputChange('weight', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select weight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lace">Lace</SelectItem>
                <SelectItem value="super fine">Super Fine</SelectItem>
                <SelectItem value="fine">Fine</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="bulky">Bulky</SelectItem>
                <SelectItem value="super bulky">Super Bulky</SelectItem>
                <SelectItem value="jumbo">Jumbo</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              Material
              {getConfidenceBadge('material')}
            </Label>
            <Input
              value={formData.material || ''}
              onChange={(e) => handleInputChange('material', e.target.value)}
              placeholder="e.g., Cotton, Wool, Acrylic"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              Brand Color
              {getConfidenceBadge('brandColor')}
            </Label>
            <Input
              value={formData.brandColor || ''}
              onChange={(e) => handleInputChange('brandColor', e.target.value)}
              placeholder="Brand's color name"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              Length (yards)
              {getConfidenceBadge('length')}
            </Label>
            <Input
              type="number"
              value={formData.length || ''}
              onChange={(e) => handleInputChange('length', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={formData.qty || 1}
              onChange={(e) => handleInputChange('qty', parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label>Hook Size</Label>
            <Input
              value={formData.hookSize || ''}
              onChange={(e) => handleInputChange('hookSize', e.target.value)}
              placeholder="e.g., H-8, 5.0mm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.vintage || false}
              onCheckedChange={(checked) => handleInputChange('vintage', checked)}
            />
            <Label>Vintage yarn</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.multicolor || false}
              onCheckedChange={(checked) => handleInputChange('multicolor', checked)}
            />
            <Label>Multicolor</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.machineWash || false}
              onCheckedChange={(checked) => handleInputChange('machineWash', checked)}
            />
            <Label>Machine washable</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.machineDry || false}
              onCheckedChange={(checked) => handleInputChange('machineDry', checked)}
            />
            <Label>Machine dryable</Label>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Yarn
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Fields marked with confidence badges: 
          <Badge variant="default" className="mx-1"><Check className="h-3 w-3 mr-1" />High</Badge>
          are auto-filled with high confidence,
          <Badge variant="secondary" className="mx-1"><AlertCircle className="h-3 w-3 mr-1" />Medium</Badge>
          should be reviewed, and
          <Badge variant="outline" className="mx-1"><AlertCircle className="h-3 w-3 mr-1" />Low</Badge>
          need manual entry.
        </div>
      </CardContent>
    </Card>
  );
}
