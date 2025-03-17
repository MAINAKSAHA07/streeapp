
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Crosshair } from "lucide-react";
import { DeviceData } from "@shared/schema";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";

interface LocationMapProps {
  deviceData: DeviceData | null;
}

export function LocationMap({ deviceData }: LocationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [circleRef, setCircleRef] = useState<L.Circle | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        zoomControl: true,
        attributionControl: true
      }).setView([0, 0], 13);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    if (deviceData?.location) {
      const { lat, lng } = deviceData.location;
      
      // Update or create marker with custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span class="text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg></span>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      // Update accuracy circle
      if (deviceData.accuracy) {
        setAccuracy(deviceData.accuracy);
        if (circleRef) {
          circleRef.setLatLng([lat, lng]).setRadius(deviceData.accuracy);
        } else {
          const circle = L.circle([lat, lng], {
            radius: deviceData.accuracy,
            color: 'rgba(var(--primary), 0.2)',
            fillColor: 'rgba(var(--primary), 0.1)',
            fillOpacity: 0.3
          }).addTo(mapRef.current);
          setCircleRef(circle);
        }
      }

      // Update speed and heading if available
      if (deviceData.speed) setSpeed(deviceData.speed);
      if (deviceData.heading) setHeading(deviceData.heading);
      
      mapRef.current.setView([lat, lng]);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        setCircleRef(null);
      }
    };
  }, [deviceData]);

  const centerOnDevice = () => {
    if (deviceData?.location && mapRef.current) {
      mapRef.current.setView([deviceData.location.lat, deviceData.location.lng], 15);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Tracking
          </div>
          <Button variant="outline" size="sm" onClick={centerOnDevice}>
            <Crosshair className="h-4 w-4 mr-2" />
            Center
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          id="map" 
          className="h-[400px] rounded-lg border mb-4"
          style={{ background: '#f0f0f0' }}
        />
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Accuracy</span>
            <span className="font-medium">{accuracy ? `${accuracy.toFixed(1)}m` : 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Speed</span>
            <span className="font-medium">{speed ? `${(speed * 3.6).toFixed(1)} km/h` : 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Heading</span>
            <span className="font-medium">{heading ? `${heading.toFixed(0)}°` : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
