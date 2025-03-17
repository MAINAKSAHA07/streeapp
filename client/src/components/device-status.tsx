import { DeviceData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Battery, Wifi, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DeviceStatusProps {
  data: DeviceData | null;
}

export function DeviceStatus({ data }: DeviceStatusProps) {
  const { user } = useAuth();

  const toggleShockMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest("PATCH", `/api/device-settings/${user?.id}`, {
        shockEnabled: enabled,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/device-data/${user?.id}`] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Device Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className={`h-5 w-5 ${data?.batteryLevel && data.batteryLevel < 20 ? 'text-destructive' : ''}`} />
            <span>Battery</span>
          </div>
          <span className="font-medium">{data?.batteryLevel || 0}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className={`h-5 w-5 ${data?.isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>Connection</span>
          </div>
          <span className="font-medium">{data?.isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Electric Shock Protection</p>
              <p className="text-sm text-muted-foreground">Enable electric shock defense mechanism</p>
            </div>
            <Switch
              checked={data?.shockEnabled || false}
              onCheckedChange={(checked) => toggleShockMutation.mutate(checked)}
              disabled={toggleShockMutation.isPending || !data?.isConnected}
            />
          </div>
        </div>

        <Button 
          variant="secondary" 
          className="w-full"
          disabled={!data?.isConnected}
          onClick={() => {
            // Trigger device test
          }}
        >
          Test Device
        </Button>
      </CardContent>
    </Card>
  );
}
