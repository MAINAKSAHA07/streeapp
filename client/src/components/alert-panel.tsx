import { Alert as AlertType } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Bell, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface AlertPanelProps {
  alert: AlertType | null;
  alerts: AlertType[];
}

export function AlertPanel({ alert, alerts }: AlertPanelProps) {
  const { user } = useAuth();

  const createAlertMutation = useMutation({
    mutationFn: async (level: number) => {
      const res = await apiRequest("POST", "/api/alerts", {
        userId: user?.id,
        level,
        location: { lat: 0, lng: 0 }, // Would use real GPS coordinates
        details: `Manual level ${level} alert triggered`
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/alerts/${user?.id}`] });
    },
  });

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Emergency Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="destructive"
            size="lg"
            className="h-24"
            onClick={() => createAlertMutation.mutate(2)}
            disabled={createAlertMutation.isPending}
          >
            <AlertCircle className="h-8 w-8 mb-1" />
            <span className="block">Emergency Alert</span>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="h-24"
            onClick={() => createAlertMutation.mutate(3)}
            disabled={createAlertMutation.isPending}
          >
            <AlertCircle className="h-8 w-8 mb-1" />
            <span className="block">Panic Button</span>
          </Button>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Recent Alerts</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                >
                  {alert.resolved ? (
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      Level {alert.level} Alert
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {alert.details}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(alert.timestamp), "PPp")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
