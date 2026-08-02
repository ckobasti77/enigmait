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

type ReducedMotionOptions = {
  /**
   * Whether Save-Data and a low battery also count as "reduce motion".
   *
   * Defaults to `true`, which is right for the things this gate was written
   * for: the background video, the dot field, the 3D scenes - continuous costs
   * that run for as long as the page is open.
   *
   * Pass `false` for one-shot entrances (the process card unlock, the services
   * panel trace). Those are the brand, they cost a few hundred milliseconds
   * once, and silently deleting them because a laptop dipped under 20% is a
   * far bigger regression than the frames it saves. The OS preference is still
   * honoured either way - that one is an explicit request from the user.
   */
  includeDataAndBattery?: boolean;
};

export function usePrefersReducedMotion({
  includeDataAndBattery = true,
}: ReducedMotionOptions = {}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!includeDataAndBattery) return mediaQuery.matches;
    const connection = getConnection();
    return computePreference(mediaQuery.matches, Boolean(connection?.saveData), false);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = includeDataAndBattery ? getConnection() : null;
    let lowBattery = false;

    const updatePreference = () => {
      setPrefersReducedMotion(
        includeDataAndBattery
          ? computePreference(mediaQuery.matches, Boolean(connection?.saveData), lowBattery)
          : mediaQuery.matches
      );
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
    if (includeDataAndBattery && hasBatteryAPI()) {
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
  }, [includeDataAndBattery]);

  return prefersReducedMotion;
}

type BatteryManager = {
  charging: boolean;
  level: number;
  addEventListener: (event: "levelchange" | "chargingchange", cb: () => void) => void;
  removeEventListener: (event: "levelchange" | "chargingchange", cb: () => void) => void;
};
