
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsSummary } from "@/utils/stats-utils";
import { YarnItem } from "@/types/yarn";
import { useEffect, useState } from "react";
import { calculateStats } from "@/utils/stats-utils";

interface SummaryCardsProps {
  data: YarnItem[];
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  
  useEffect(() => {
    setStats(calculateStats(data));
  }, [data]);
  
  if (!stats) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-in">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Total Skeins</CardTitle>
          <CardDescription>Number of yarn skeins in collection</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{stats.totalSkeins}</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Total Yards</CardTitle>
          <CardDescription>Total length of all yarn</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{stats.totalYards.toLocaleString()}</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Multicolor</CardTitle>
          <CardDescription>Percentage of multicolor yarn</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{stats.multicolorPercentage}%</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Brands</CardTitle>
          <CardDescription>Number of unique yarn brands</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{stats.totalBrands}</p>
        </CardContent>
      </Card>
    </div>
  );
}
