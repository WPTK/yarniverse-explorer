
import { ColorGroup } from "@/types/yarn";

// Named CSS colors to HSL values (approximated)
const COLOR_MAP: Record<string, [number, number, number]> = {
  // Reds
  'red': [0, 100, 50],
  'crimson': [348, 83, 47],
  'maroon': [0, 100, 25],
  'burgundy': [345, 100, 25],
  'ruby': [337, 90, 41],
  'terracotta': [10, 60, 55],
  
  // Pinks
  'pink': [350, 100, 88],
  'hotpink': [330, 100, 71],
  'magenta': [300, 100, 50],
  'fuchsia': [300, 100, 50],
  'rose': [330, 100, 76],
  'light pink': [351, 100, 90],
  
  // Yellows
  'yellow': [60, 100, 50],
  'light yellow': [60, 80, 80],
  'dark yellow': [50, 100, 40],
  'mustard yellow': [45, 100, 50],
  
  // Purples
  'purple': [270, 100, 50],
  'violet': [270, 100, 50],
  'lavender': [240, 67, 94],
  'lilac': [283, 43, 85],
  'indigo': [275, 100, 25],
  
  // Blues
  'blue': [210, 100, 50],
  'navy': [240, 100, 25],
  'royalblue': [225, 73, 57],
  'skyblue': [197, 71, 73],
  'slate blue': [248, 53, 58],
  'baby blue': [200, 80, 85],
  'aquarmarine': [160, 100, 75],
  
  // Greens
  'green': [120, 100, 25],
  'lime': [120, 100, 50],
  'emerald': [140, 50, 45],
  'mint': [150, 100, 98],
  'olive': [60, 100, 25],
  'forest': [120, 61, 34],
  'sage': [135, 30, 60],
  
  // Teals
  'teal': [180, 100, 25],
  'cyan': [180, 100, 50],
  'turquoise': [174, 72, 56],
  
  // Oranges
  'orange': [30, 100, 50],
  'peach': [30, 100, 80],
  'coral': [16, 100, 66],
  
  // Browns
  'brown': [30, 59, 53],
  'chocolate': [25, 75, 47],
  'tan': [34, 44, 69],
  'beige': [60, 56, 91],
  'coffee': [25, 25, 30],
  'dark brown': [20, 70, 30],
  'taupe': [28, 17, 65],
  'dark taupe': [25, 25, 45],
  
  // Neutrals
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
  
  // Metallics
  'tinsel': [60, 30, 75], // Approximation as a golden/silver sparkle
  'gold': [50, 100, 50],
  'silver': [0, 0, 75],
};

// Color groups - used for filtering
const COLOR_GROUPS: ColorGroup[] = [
  { 
    name: 'Reds', 
    colors: ['red', 'crimson', 'maroon', 'burgundy', 'ruby', 'terracotta'], 
    hue: 0 
  },
  { 
    name: 'Pinks', 
    colors: ['pink', 'hotpink', 'magenta', 'fuchsia', 'rose', 'light pink'], 
    hue: 330 
  },
  { 
    name: 'Yellows', 
    colors: ['yellow', 'light yellow', 'dark yellow', 'mustard yellow'], 
    hue: 60 
  },
  { 
    name: 'Oranges', 
    colors: ['orange', 'peach', 'coral'], 
    hue: 30 
  },
  { 
    name: 'Purples', 
    colors: ['purple', 'violet', 'lavender', 'lilac', 'indigo'], 
    hue: 270 
  },
  { 
    name: 'Blues', 
    colors: ['blue', 'navy', 'royalblue', 'skyblue', 'slate blue', 'baby blue'], 
    hue: 210 
  },
  { 
    name: 'Teals', 
    colors: ['teal', 'cyan', 'turquoise', 'aquarmarine'], 
    hue: 180 
  },
  { 
    name: 'Greens', 
    colors: ['green', 'lime', 'emerald', 'mint', 'olive', 'forest', 'sage'], 
    hue: 120 
  },
  { 
    name: 'Browns', 
    colors: ['brown', 'chocolate', 'tan', 'beige', 'coffee', 'dark brown', 'taupe', 'dark taupe'], 
    hue: 30 
  },
  { 
    name: 'Neutrals', 
    colors: ['white', 'gray', 'grey', 'silver', 'black', 'cream', 'ivory', 'offwhite', 'charcoal', 'light gray'],
    hue: 0 
  },
  { 
    name: 'Metallics', 
    colors: ['tinsel', 'gold', 'silver'], 
    hue: 45 
  },
];

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

