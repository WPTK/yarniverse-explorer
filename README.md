
# Yarniverse Explorer

A modern, responsive web application for visualizing and exploring your yarn collection.

## Features

- **Interactive Data Views**: Toggle between table and grid views
- **Powerful Filtering**: Filter by brand, weight, colors, and more
- **Modern Visualizations**: Automatically generated charts and graphs
- **Summary Statistics**: Quick overview of your collection
- **Saved Views**: Save your filter combinations for quick access
- **Infinite Scroll**: Smooth loading for large collections
- **Dark Mode**: Toggle between light and dark themes
- **Fully Responsive**: Works on desktop and mobile devices

## Setup Instructions

### 1. CSV File Configuration

The app reads yarn data from a CSV file stored at `/public/data/yarn-collection.csv`. The file should have the following columns:

```
Brand,Sub-brand,Length (yards),Multicolor,Weight,Rows,Color 1,Color 2,Color 3
```

Example row:
```
Lion Brand,Wool-Ease,197,No,Medium,28,Navy Blue,,
```

### 2. Customizing CSV Column Names

If you need to change the CSV column names or structure, you can update the mapping in the file:

`src/services/csv-service.ts`

Look for the `CSV_COLUMN_MAPPING` object and update the property values to match your CSV headers:

```typescript
const CSV_COLUMN_MAPPING = {
  brand: "Brand",                // Your CSV header for brand
  subBrand: "Sub-brand",         // Your CSV header for sub-brand
  length: "Length (yards)",      // Your CSV header for length
  multicolor: "Multicolor",      // Your CSV header for multicolor flag
  weight: "Weight",              // Your CSV header for weight
  rows: "Rows",                  // Your CSV header for rows
  color1: "Color 1",             // Your CSV header for first color
  color2: "Color 2",             // Your CSV header for second color
  color3: "Color 3",             // Your CSV header for third color
};
```

### 3. Working with Colors

The app automatically categorizes colors into color groups based on common color names. If you want to add more color names or modify existing ones, you can update:

`src/utils/color-utils.ts`

## Usage

### Filtering

- Use the filters panel on the left to filter your yarn collection
- Multiple filters can be combined
- Click "Reset" to clear all filters at once

### Sorting (Table View)

- Click on column headers to sort the data
- Click again to toggle between ascending and descending order

### Saving Views

- Click "Save Current View" to save your current filter configuration
- Enter a name for your view
- Access saved views from the Saved Views panel

### Switching Between Views

- Use the table/grid toggle at the top right of the data panel

## Project Structure

- `/src/components`: UI components
- `/src/contexts`: Data contexts (yarn data provider)
- `/src/services`: Services for data loading and processing
- `/src/utils`: Utility functions for colors, statistics, etc.
- `/src/types`: TypeScript type definitions
- `/public/data`: Location for the CSV data file

## Feedback and Issues

If you encounter any issues or have feedback, please submit it to the project repository.

