import { useEffect, useState } from "react";
import * as Location from "expo-location";

export interface DeviceLocation {
  city: string;
  region?: string;
  country?: string;
  /** Human-friendly label, e.g. "London, UK" — falls back to "Near you" when reverse-geocode unavailable */
  label: string;
  latitude: number;
  longitude: number;
}

export type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error";

export function useDeviceLocation(autoFetch = true) {
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");

  const fetch = async (): Promise<DeviceLocation | null> => {
    setStatus("requesting");
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setStatus("denied");
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // reverseGeocodeAsync is iOS/Android only — try, but fall back to coords-only on web
      let city = "";
      let region: string | undefined;
      let country: string | undefined;
      try {
        const places = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const p = places[0];
        city = p?.city ?? p?.subregion ?? p?.region ?? "";
        region = p?.region ?? undefined;
        country = p?.country ?? undefined;
      } catch {
        // Web fallback — silent
      }

      const label = city ? [city, country].filter(Boolean).join(", ") : "Near you";

      const result: DeviceLocation = {
        city,
        region,
        country,
        label,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setLocation(result);
      setStatus("granted");
      return result;
    } catch {
      setStatus("error");
      return null;
    }
  };

  useEffect(() => {
    if (autoFetch) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  const clear = () => {
    setLocation(null);
    setStatus("idle");
  };

  return { location, status, refetch: fetch, clear };
}
