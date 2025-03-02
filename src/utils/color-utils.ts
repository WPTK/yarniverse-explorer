import { ColorGroup } from "@/types/yarn";

// Define the color map structure using an object of color categories
const COLOR_MAP_BY_CATEGORY: Record<string, Record<string, [number, number, number]>> = {
  // Reds
  reds: {
    'red': [0, 100, 50],
    'crimson': [348, 83, 47],
    'maroon': [0, 100, 25],
    'burgundy': [345, 100, 25],
    'ruby': [337, 90, 41],
    'terracotta': [10, 60, 55],
  },
  
  // Pinks
  pinks: {
    'pink': [350, 100, 88],
    'hotpink': [330, 100, 71],
    'magenta': [300, 100, 50],
    'fuchsia': [300, 100, 50],
    'rose': [330, 100, 76],
    'light pink': [351, 100, 90],
  },
  
  // Yellows
  yellows: {
    'yellow': [60, 100, 50],
    'light yellow': [60, 80, 80],
    'dark yellow': [50, 100, 40],
    'mustard yellow': [45, 100, 50],
  },
  
  // Purples
  purples: {
    'purple': [270, 100, 50],
    'violet': [270, 100, 50],
    'lavender': [240, 67, 94],
    'lilac': [283, 43, 85],
    'indigo': [275, 100, 25],
  },
  
  // Blues
  blues: {
    'blue': [210, 100, 50],
    'navy': [240, 100, 25],
    'royalblue': [225, 73, 57],
    'skyblue': [197, 71, 73],
    'slate blue': [248, 53, 58],
    'baby blue': [200, 80, 85],
    'aquarmarine': [160, 100, 75],
  },
  
  // Greens
  greens: {
    'green': [120, 100, 25],
    'lime': [120, 100, 50],
    'emerald': [140, 50, 45],
    'mint': [150, 100, 98],
    'olive': [60, 100, 25],
    'forest': [120, 61, 34],
    'sage': [135, 30, 60],
  },
  
  // Teals
  teals: {
    'teal': [180, 100, 25],
    'cyan': [180, 100, 50],
    'turquoise': [174, 72, 56],
  },
  
  // Oranges
  oranges: {
    'orange': [30, 100, 50],
    'peach': [30, 100, 80],
    'coral': [16, 100, 66],
  },
  
  // Browns
  browns: {
    'brown': [30, 59, 53],
    'chocolate': [25, 75, 47],
    'tan': [34, 44, 69],
    'beige': [60, 56, 91],
    'coffee': [25, 25, 30],
    'dark brown': [20, 70, 30],
    'taupe': [28, 17, 65],
    'dark taupe': [25, 25, 45],
  },
  
  // Neutrals
  neutrals: {
    'white': [0, 0, 100],
    'gray': [0, 0, 50],
    'grey': [0, 0, 50],
    'silver': [0, 0, 75],
    'black': [0, 0, 0],
    'cream': [60, 100, 94],
    'ivory': [60, 100, 97],
    'offwhite': [60, 20, 97],
    'charcoal': [0, 0, 25],
    'light gray': [0, 0, 85],
  },
  
  // Metallics
  metallics: {
    'tinsel': [60, 30, 75],
    'gold': [50, 100, 50],
    'silver metallic': [0, 0, 83],
  },
};

// Flatten the nested structure to maintain compatibility with existing code
const COLOR_MAP: Record<string, [number, number, number]> = Object.entries(COLOR_MAP_BY_CATEGORY)
  .reduce((acc, [_, colorMap]) => ({...acc, ...colorMap}), {});

// Color groups - used for filtering
const COLOR_GROUPS: ColorGroup[] = [
  { 
    name: 'Reds', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.reds), 
    hue: 0 
  },
  { 
    name: 'Pinks', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.pinks), 
    hue: 330 
  },
  { 
    name: 'Yellows', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.yellows), 
    hue: 60 
  },
  { 
    name: 'Oranges', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.oranges), 
    hue: 30 
  },
  { 
    name: 'Purples', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.purples), 
    hue: 270 
  },
  { 
    name: 'Blues', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.blues), 
    hue: 210 
  },
  { 
    name: 'Teals', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.teals), 
    hue: 180 
  },
  { 
    name: 'Greens', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.greens), 
    hue: 120 
  },
  { 
    name: 'Browns', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.browns), 
    hue: 30 
  },
  { 
    name: 'Neutrals', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.neutrals),
    hue: 0 
  },
  { 
    name: 'Metallics', 
    colors: Object.keys(COLOR_MAP_BY_CATEGORY.metallics),
    hue: 45 
  },
];

// Keep all the existing functions the same
/**
 * Get the best matching color group for a color name
 */
export function getColorGroup(colorName: string): ColorGroup | undefined {
  const lowerColor = colorName.toLowerCase().trim();
  
  // First, try to find an exact match in the color groups
  for (const group of COLOR_GROUPS) {
    if (group.colors.includes(lowerColor)) {
      return group;
    }
  }
  
  // If no exact match, try to find by substring
  for (const group of COLOR_GROUPS) {
    for (const groupColor of group.colors) {
      if (lowerColor.includes(groupColor) || groupColor.includes(lowerColor)) {
        return group;
      }
    }
  }
  
  // If still no match, look at all known colors
  for (const [knownColor, [hue]] of Object.entries(COLOR_MAP)) {
    if (lowerColor.includes(knownColor) || knownColor.includes(lowerColor)) {
      // Find the group that has this color or the closest hue
      return COLOR_GROUPS.find(g => g.colors.includes(knownColor)) || 
             COLOR_GROUPS.reduce((prev, curr) => 
               Math.abs(curr.hue - hue) < Math.abs(prev.hue - hue) ? curr : prev
             );
    }
  }
  
  // Default to neutrals if no match found
  return COLOR_GROUPS.find(g => g.name === 'Neutrals');
}

/**
 * Get an approximate color code for a color name
 */
export function getColorCode(colorName: string): string {
  const lowerColor = colorName.toLowerCase().trim();
  
  // Direct matches
  if (lowerColor in COLOR_MAP) {
    const [h, s, l] = COLOR_MAP[lowerColor];
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  
  // Substring matches
  for (const [knownColor, hsl] of Object.entries(COLOR_MAP)) {
    if (lowerColor.includes(knownColor) || knownColor.includes(lowerColor)) {
      const [h, s, l] = hsl;
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  }
  
  // Get the color group and use its hue
  const group = getColorGroup(lowerColor);
  if (group) {
    // Use the group's hue with moderate saturation and lightness
    return `hsl(${group.hue}, 70%, 60%)`;
  }
  
  // Default gray if we can't determine
  return 'hsl(0, 0%, 60%)';
}

/**
 * Get all available color groups
 */
export function getAllColorGroups(): ColorGroup[] {
  return COLOR_GROUPS;
}
