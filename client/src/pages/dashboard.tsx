import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { DeviceStatus } from "@/components/device-status";
import { AlertPanel } from "@/components/alert-panel";
import { LocationMap } from "@/components/location-map";
import { VitalsMonitor } from "@/components/vitals-monitor";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu } from "lucide-react";
import { wsClient } from "@/lib/websocket";
import { useEffect, useState } from "react";
import { DeviceData, Alert } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">STREE</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="relative"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VitalsMonitor deviceData={deviceData} />
            <LocationMap deviceData={deviceData} />
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