import { useEffect, useState } from "react";

const hasBatteryAPI = () =>
  typeof navigator !== "undefined" && "getBattery" in navigator && typeof navigator.getBattery === "function";

type NetworkInformation = {
  saveData?: boolean;
  addEventListener?: (event: "change", cb: () => void) => void;
  removeEventListener?: (event: "change", cb: () => void) => void;
};

const getConnection = () => {
  if (typeof navigator === "undefined") return null;
  return (navigator as unknown as { connection?: NetworkInformation }).connection ?? null;
};

const computePreference = (mediaMatches: boolean, connectionSaveData: boolean, lowBattery: boolean) =>
  mediaMatches || connectionSaveData || lowBattery;

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = getConnection();
    return computePreference(mediaQuery.matches, Boolean(connection?.saveData), false);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = getConnection();
    let lowBattery = false;

    const updatePreference = () => {
      setPrefersReducedMotion(computePreference(mediaQuery.matches, Boolean(connection?.saveData), lowBattery));
    };

    updatePreference();

    const handleMediaChange = () => updatePreference();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    const handleConnectionChange = () => updatePreference();
    connection?.addEventListener?.("change", handleConnectionChange);

    let cleanupBattery: (() => void) | undefined;
    if (hasBatteryAPI()) {
      (navigator as unknown as { getBattery: () => Promise<BatteryManager> })
        .getBattery()
        .then((battery) => {
          const handleBattery = () => {
            lowBattery = !battery.charging && battery.level <= 0.2;
            updatePreference();
          };

          handleBattery();
          battery.addEventListener("levelchange", handleBattery);
          battery.addEventListener("chargingchange", handleBattery);

          cleanupBattery = () => {
            battery.removeEventListener("levelchange", handleBattery);
            battery.removeEventListener("chargingchange", handleBattery);
          };
        })
        .catch(() => {
          lowBattery = false;
        });
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      connection?.removeEventListener?.("change", handleConnectionChange);
      cleanupBattery?.();
    };
  }, []);

  return prefersReducedMotion;
}

type BatteryManager = {
  charging: boolean;
  level: number;
  addEventListener: (event: "levelchange" | "chargingchange", cb: () => void) => void;
  removeEventListener: (event: "levelchange" | "chargingchange", cb: () => void) => void;
};
