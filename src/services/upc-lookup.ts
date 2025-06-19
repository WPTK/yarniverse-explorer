
import { YarnItem } from '@/types/yarn';

export interface UPCLookupResult {
  upc: string;
  confidence: number;
  source: string;
  data: Partial<YarnItem>;
  productImage?: string;
  rawData?: any;
}

export interface ProductData {
  brand?: string;
  productName?: string;
  description?: string;
  category?: string;
  weight?: string;
  yardage?: number;
  material?: string;
  color?: string;
  image?: string;
  price?: number;
}

class UPCLookupService {
  private cache = new Map<string, UPCLookupResult>();
  private failedLookups = new Set<string>();
  
  /**
   * Main lookup method that tries multiple data sources
   */
  async lookupUPC(upc: string): Promise<UPCLookupResult | null> {
    // Check cache first
    if (this.cache.has(upc)) {
      return this.cache.get(upc)!;
    }
    
    // Skip if we've already failed on this UPC recently
    if (this.failedLookups.has(upc)) {
      return null;
    }
    
    console.log('Looking up UPC:', upc);
    
    // Try multiple sources in parallel
    const lookupPromises = [
      this.lookupOpenFoodFacts(upc),
      this.lookupBarcodeLookup(upc),
      this.lookupUPCItemDB(upc),
    ];
    
    try {
      const results = await Promise.allSettled(lookupPromises);
      const validResults = results
        .filter((result): result is PromiseFulfilledResult<ProductData | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      if (validResults.length === 0) {
        this.failedLookups.add(upc);
        return null;
      }
      
      // Use the first valid result (could be enhanced to merge multiple sources)
      const bestResult = validResults[0];
      const yarnData = this.mapToYarnItem(bestResult!, upc);
      
      const result: UPCLookupResult = {
        upc,
        confidence: this.calculateConfidence(bestResult!),
        source: 'Multiple Sources',
        data: yarnData,
        productImage: bestResult!.image,
      };
      
      this.cache.set(upc, result);
      return result;
      
    } catch (error) {
      console.error('UPC lookup failed:', error);
      this.failedLookups.add(upc);
      return null;
    }
  }
  
  /**
   * OpenFoodFacts API lookup
   */
  private async lookupOpenFoodFacts(upc: string): Promise<ProductData | null> {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${upc}.json`);
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.status !== 1 || !data.product) return null;
      
      const product = data.product;
      return {
        brand: product.brands?.split(',')[0]?.trim(),
        productName: product.product_name,
        description: product.generic_name,
        category: product.categories?.split(',')[0]?.trim(),
        image: product.image_url,
      };
    } catch (error) {
      console.error('OpenFoodFacts lookup failed:', error);
      return null;
    }
  }
  
  /**
   * Barcode Lookup API (requires API key in production)
   */
  private async lookupBarcodeLookup(upc: string): Promise<ProductData | null> {
    try {
      // This would require an API key in production
      // For now, we'll simulate a response
      console.log('Barcode Lookup API would be called here for:', upc);
      return null;
    } catch (error) {
      console.error('Barcode Lookup failed:', error);
      return null;
    }
  }
  
  /**
   * UPC Item DB lookup
   */
  private async lookupUPCItemDB(upc: string): Promise<ProductData | null> {
    try {
      const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      if (!data.items || data.items.length === 0) return null;
      
      const item = data.items[0];
      return {
        brand: item.brand,
        productName: item.title,
        description: item.description,
        category: item.category,
        image: item.images?.[0],
      };
    } catch (error) {
      console.error('UPC Item DB lookup failed:', error);
      return null;
    }
  }
  
  /**
   * Map external product data to YarnItem format
   */
  private mapToYarnItem(product: ProductData, upc: string): Partial<YarnItem> {
    const yarnData: Partial<YarnItem> = {
      id: `yarn-${Date.now()}`, // Temporary ID
    };
    
    // Brand mapping
    if (product.brand) {
      yarnData.brand = this.normalizeBrand(product.brand);
    }
    
    // Extract yarn-specific info from product name/description
    const text = `${product.productName || ''} ${product.description || ''}`.toLowerCase();
    
    // Extract weight
    yarnData.weight = this.extractWeight(text);
    
    // Extract yardage
    const yardageMatch = text.match(/(\d+)\s*(yard|yd|meter|m)/i);
    if (yardageMatch) {
      yarnData.length = parseInt(yardageMatch[1]);
    }
    
    // Extract material/fiber content
    yarnData.material = this.extractMaterial(text);
    
    // Extract color from product name
    if (product.productName) {
      yarnData.brandColor = this.extractColor(product.productName);
      yarnData.colors = yarnData.brandColor ? [yarnData.brandColor] : [];
    }
    
    // Set default values
    yarnData.vintage = false;
    yarnData.qty = 1;
    yarnData.multicolor = false;
    yarnData.machineWash = true;
    yarnData.machineDry = false;
    yarnData.rows = 0;
    yarnData.hookSize = '';
    yarnData.softnessRanking = '';
    yarnData.subBrand = '';
    
    return yarnData;
  }
  
  /**
   * Normalize brand names
   */
  private normalizeBrand(brand: string): string {
    const brandMap: Record<string, string> = {
      'red heart': 'Red Heart',
      'bernat': 'Bernat',
      'lion brand': 'Lion Brand',
      'caron': 'Caron',
      'patons': 'Patons',
    };
    
    const normalized = brand.toLowerCase().trim();
    return brandMap[normalized] || brand;
  }
  
  /**
   * Extract yarn weight from text
   */
  private extractWeight(text: string): any {
    const weightMap: Record<string, any> = {
      'lace': 'lace',
      'sport': 'fine',
      'dk': 'light',
      'worsted': 'medium',
      'aran': 'medium',
      'chunky': 'bulky',
      'super chunky': 'super bulky',
    };
    
    for (const [key, value] of Object.entries(weightMap)) {
      if (text.includes(key)) {
        return value;
      }
    }
    return 'medium'; // Default
  }
  
  /**
   * Extract material/fiber content from text
   */
  private extractMaterial(text: string): string {
    const materials = ['cotton', 'wool', 'acrylic', 'polyester', 'nylon', 'silk', 'alpaca', 'mohair'];
    
    for (const material of materials) {
      if (text.includes(material)) {
        return material.charAt(0).toUpperCase() + material.slice(1);
      }
    }
    return 'Mixed';
  }
  
  /**
   * Extract color from product name
   */
  private extractColor(productName: string): string {
    const colors = [
      'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'brown',
      'gray', 'grey', 'navy', 'teal', 'maroon', 'olive', 'lime', 'aqua', 'fuchsia', 'silver'
    ];
    
    const name = productName.toLowerCase();
    for (const color of colors) {
      if (name.includes(color)) {
        return color.charAt(0).toUpperCase() + color.slice(1);
      }
    }
    return 'Unknown';
  }
  
  /**
   * Calculate confidence score based on available data
   */
  private calculateConfidence(product: ProductData): number {
    let score = 0;
    const maxScore = 7;
    
    if (product.brand) score += 1;
    if (product.productName) score += 2;
    if (product.description) score += 1;
    if (product.category?.toLowerCase().includes('yarn')) score += 3;
    
    return Math.min(score / maxScore, 1);
  }
  
  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    this.failedLookups.clear();
  }
}

export const upcLookupService = new UPCLookupService();
