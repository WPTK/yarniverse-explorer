
/**
 * Sample Data Module
 * 
 * Provides sample CSV data for demonstration purposes when no actual CSV file is available.
 * This eliminates the need for a physical CSV file during development or testing.
 */

/**
 * Returns sample CSV content as a string, mimicking what would be loaded from a CSV file.
 * The data structure matches the expected format for the yarn collection.
 */
export function getSampleCSVData(): string {
  return `Brand,Sub-brand,Length (yards),Multicolor,Weight,Rows,Color 1,Color 2,Color 3
Lion Brand,Wool-Ease,197,No,Medium,28,Navy Blue,,
Patons,Classic Wool,223,No,Medium,32,Red,,
Caron,Simply Soft,315,No,Medium,24,Soft Blue,,
Red Heart,Super Saver,364,Yes,Medium,30,Red,White,Blue
Bernat,Blanket,220,No,Bulky,18,Gray,,
Lion Brand,Homespun,185,Yes,Bulky,16,Purple,Blue,
Patons,Silk Bamboo,102,No,Fine,42,Ivory,,
Lily Sugar'n Cream,Solids,95,No,Medium,36,Mint Green,,
Lion Brand,Mandala,590,Yes,Light,36,Pink,Purple,Blue
Rowan,Pure Wool,137,No,Medium,28,Charcoal,,
Cascade,220,220,No,Medium,30,Forest Green,,
Malabrigo,Rios,210,No,Medium,30,Teal,,
Lion Brand,Shawl in a Ball,518,Yes,Light,34,Blue,Gray,White
Berroco,Ultra Alpaca,215,No,Medium,32,Brown,,
Knit Picks,Wool of the Andes,110,No,Medium,30,Burgundy,,
Noro,Kureyon,110,Yes,Medium,28,Red,Orange,Purple`;
}
