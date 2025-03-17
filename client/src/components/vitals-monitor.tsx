import { DeviceData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

interface VitalsMonitorProps {
  deviceData: DeviceData | null;
}

export function VitalsMonitor({ deviceData }: VitalsMonitorProps) {
  // Sample data for the chart - in production this would come from historical data
  const mockData = [
    { time: '00:00', heartRate: 75, stressLevel: 30 },
    { time: '00:05', heartRate: 78, stressLevel: 35 },
    { time: '00:10', heartRate: 80, stressLevel: 40 },
    { time: '00:15', heartRate: 85, stressLevel: 50 },
    { time: '00:20', heartRate: deviceData?.heartRate || 82, stressLevel: deviceData?.stressLevel || 45 },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-card/80">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Health Vitals Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-primary/10 border">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-medium">Heart Rate</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {deviceData?.heartRate || '--'} 
              <span className="text-base font-normal text-muted-foreground ml-1">BPM</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Normal Range: 60-100 BPM</p>
          </div>

          <div className="p-6 rounded-xl bg-primary/10 border">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-medium">Stress Level</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {deviceData?.stressLevel || '--'}
              <span className="text-base font-normal text-muted-foreground ml-1">%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Target: Below 60%</p>
          </div>
        </div>

        <div className="h-[300px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--foreground))"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="heartRate" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="stressLevel" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}