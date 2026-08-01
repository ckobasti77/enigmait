"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type MoodContextValue = {
  moodActive: boolean;
  setMoodActive: (active: boolean) => void;
  progressRef: React.MutableRefObject<number>;
  moodEngaged: boolean;
  setMoodEngaged: (engaged: boolean) => void;
};

const MoodContext = createContext<MoodContextValue | null>(null);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [moodActive, setMoodActiveState] = useState(false);
  const [moodEngaged, setMoodEngaged] = useState(false);
  const progressRef = useRef(0);

  const setMoodActive = useCallback((active: boolean) => {
    setMoodActiveState(active);
    if (!active) {
      progressRef.current = 0;
      setMoodEngaged(false);
    }
  }, []);

  // Sync data-mood attribute on <html>
  useEffect(() => {
    if (moodEngaged) {
      document.documentElement.dataset.mood = "alt";
    } else {
      delete document.documentElement.dataset.mood;
    }
  }, [moodEngaged]);

  return (
    <MoodContext.Provider
      value={{ moodActive, setMoodActive, progressRef, moodEngaged, setMoodEngaged }}
    >
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error("useMood must be used within MoodProvider");
  return ctx;
}
