import { DeviceData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Vitals Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-destructive" />
              <span className="font-medium">Heart Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {deviceData?.heartRate || '--'} <span className="text-sm font-normal text-muted-foreground">BPM</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-medium">Stress Level</span>
            </div>
            <div className="text-2xl font-bold">
              {deviceData?.stressLevel || '--'} <span className="text-sm font-normal text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="heartRate" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="stressLevel" 
                stroke="hsl(var(--primary))" 
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
