
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { YarnItem } from "@/types/yarn";
import { getTopBrands, getTopColors, getWeightDistribution } from "@/utils/stats-utils";
import { getColorCode } from "@/utils/color-utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface VisualizationsProps {
  data: YarnItem[];
}

export function Visualizations({ data }: VisualizationsProps) {
  const [topBrands, setTopBrands] = useState<Array<{ name: string, count: number }>>([]);
  const [topColors, setTopColors] = useState<Array<{ name: string, count: number }>>([]);
  const [weightDistribution, setWeightDistribution] = useState<Array<{ name: string, count: number }>>([]);
  
  useEffect(() => {
    if (data.length === 0) return;
    
    setTopBrands(getTopBrands(data, 5));
    setTopColors(getTopColors(data, 5));
    setWeightDistribution(getWeightDistribution(data));
  }, [data]);
  
  // Colors for charts
  const COLORS = ['#8B5CF6', '#D946EF', '#0EA5E9', '#6E59A5', '#1EAEDB', '#33C3F0'];
  
  if (data.length === 0) {
    return (
      <Card className="glass-card h-full">
        <CardHeader>
          <CardTitle>Visualizations</CardTitle>
          <CardDescription>No data available for visualization</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Custom tooltip formatter for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-2 rounded-md shadow-md border border-border text-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p>Count: <span className="font-medium">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-2">
        <CardTitle>Visualizations</CardTitle>
        <CardDescription>
          Insights from your yarn collection
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="brands" className="h-full">
          <TabsList className="grid grid-cols-3 mx-6">
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="weights">Weights</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[300px] p-6">
            <TabsContent value="brands" className="mt-0 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBrands}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" name="Number of Items" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="weights" className="mt-0 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weightDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {weightDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="colors" className="mt-0 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topColors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Frequency" 
                    fill="#8B5CF6"
                    // Customize each bar with its color
                    shape={(props) => {
                      const { x, y, width, height, name } = props;
                      const color = getColorCode(name);
                      return (
                        <rect 
                          x={x} 
                          y={y} 
                          width={width} 
                          height={height} 
                          fill={color} 
                          stroke="none" 
                        />
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
