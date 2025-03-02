
import { YarnItem } from "@/types/yarn";

export interface StatsSummary {
  totalSkeins: number;
  totalYards: number;
  totalMiles: number;
  averageYardsPerSkein: number;
  totalBrands: number;
  totalSubBrands: number;
  weightDistribution: Record<string, number>;
  colorDistribution: Record<string, number>;
  multicolorPercentage: number;
}

export function calculateStats(data: YarnItem[]): StatsSummary {
  // Start with empty summary
  const summary: StatsSummary = {
    totalSkeins: 0,
    totalYards: 0,
    totalMiles: 0,
    averageYardsPerSkein: 0,
    totalBrands: 0,
    totalSubBrands: 0,
    weightDistribution: {},
    colorDistribution: {},
    multicolorPercentage: 0,
  };
  
  if (data.length === 0) {
    return summary;
  }
  
  // Basic counts
  summary.totalSkeins = data.length;
  summary.totalYards = data.reduce((sum, item) => sum + item.length, 0);
  summary.averageYardsPerSkein = Math.round(summary.totalYards / summary.totalSkeins);
  
  // Calculate miles (1760 yards = 1 mile)
  summary.totalMiles = summary.totalYards / 1760;
  
  // Count unique brands and sub-brands
  const uniqueBrands = new Set<string>();
  const uniqueSubBrands = new Set<string>();
  
  // Weight distribution and color collections
  const allColors: string[] = [];
  
  data.forEach(item => {
    // Brands and sub-brands
    if (item.brand) uniqueBrands.add(item.brand);
    if (item.subBrand) uniqueSubBrands.add(item.subBrand);
    
    // Weight distribution
    const weight = item.weight || "unknown";
    summary.weightDistribution[weight] = (summary.weightDistribution[weight] || 0) + 1;
    
    // Collect all colors
    item.colors.forEach(color => {
      if (color) allColors.push(color.toLowerCase().trim());
    });
  });
  
  // Set brand and sub-brand counts
  summary.totalBrands = uniqueBrands.size;
  summary.totalSubBrands = uniqueSubBrands.size;
  
  // Calculate multicolor percentage
  const multicolorCount = data.filter(item => item.multicolor).length;
  summary.multicolorPercentage = Math.round((multicolorCount / data.length) * 100);
  
  // Process all colors for color distribution
  allColors.forEach(color => {
    summary.colorDistribution[color] = (summary.colorDistribution[color] || 0) + 1;
  });
  
  return summary;
}

export function getTopBrands(data: YarnItem[], limit: number = 5): Array<{ name: string, count: number }> {
  const brandCounts: Record<string, number> = {};
  
  data.forEach(item => {
    if (item.brand) {
      brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
    }
  });
  
  return Object.entries(brandCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTopColors(data: YarnItem[], limit: number = 5): Array<{ name: string, count: number }> {
  const colorCounts: Record<string, number> = {};
  
  data.forEach(item => {
    item.colors.forEach(color => {
      if (color) {
        const normalizedColor = color.toLowerCase().trim();
        colorCounts[normalizedColor] = (colorCounts[normalizedColor] || 0) + 1;
      }
    });
  });
  
  return Object.entries(colorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getWeightDistribution(data: YarnItem[]): Array<{ name: string, count: number }> {
  const weightCounts: Record<string, number> = {};
  
  data.forEach(item => {
    const weight = item.weight || "unknown";
    weightCounts[weight] = (weightCounts[weight] || 0) + 1;
  });
  
  return Object.entries(weightCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
