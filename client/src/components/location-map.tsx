import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { DeviceData } from "@shared/schema";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationMapProps {
  deviceData: DeviceData | null;
}

export function LocationMap({ deviceData }: LocationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([0, 0], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Update marker position
    if (deviceData?.location) {
      const { lat, lng } = deviceData.location;
      
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      
      mapRef.current.setView([lat, lng]);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [deviceData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          id="map" 
          className="h-[400px] rounded-lg border"
          style={{ background: '#f0f0f0' }}
        />
      </CardContent>
    </Card>
  );
}
