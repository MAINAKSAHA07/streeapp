import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { DeviceStatus } from "@/components/device-status";
import { AlertPanel } from "@/components/alert-panel";
import { LocationMap } from "@/components/location-map";
import { VitalsMonitor } from "@/components/vitals-monitor";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";
import { wsClient } from "@/lib/websocket";
import { useEffect, useState } from "react";
import { DeviceData, Alert } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);

  const { data: initialDeviceData } = useQuery({
    queryKey: [`/api/device-data/${user?.id}`],
  });

  const { data: alerts } = useQuery({
    queryKey: [`/api/alerts/${user?.id}`],
  });

  useEffect(() => {
    if (initialDeviceData) {
      setDeviceData(initialDeviceData);
    }
  }, [initialDeviceData]);

  useEffect(() => {
    if (alerts?.length > 0) {
      setLatestAlert(alerts[0]);
    }
  }, [alerts]);

  useEffect(() => {
    const unsubscribe = wsClient.onMessage((message) => {
      if (message.type === "deviceUpdate" && "batteryLevel" in message.data) {
        setDeviceData(message.data as DeviceData);
      } else if (message.type === "alert" && "level" in message.data) {
        const alert = message.data as Alert;
        setLatestAlert(alert);
        toast({
          title: "Emergency Alert",
          description: `Level ${alert.level} alert triggered at ${alert.timestamp}`,
          variant: "destructive",
        });
      }
    });

    return () => unsubscribe();
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">SafeGuard Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => {
                // Toggle notifications panel
              }}
            >
              <Bell className="h-5 w-5" />
              {latestAlert && !latestAlert.resolved && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              <LocationMap deviceData={deviceData} />
              <VitalsMonitor deviceData={deviceData} />
            </div>
          </div>
          
          <div className="space-y-6">
            <DeviceStatus data={deviceData} />
            <AlertPanel alert={latestAlert} alerts={alerts || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
