
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

export function useLocation() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading
          };

          await fetch(`/api/device-data/${user.id}/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(location)
          });
        } catch (err) {
          console.error('Failed to update location:', err);
        }
      },
      (err) => {
        setError(err.message);
        console.error('Location error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user]);

  return { error };
}
