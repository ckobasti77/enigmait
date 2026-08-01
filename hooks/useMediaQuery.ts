import { useEffect, useState } from "react";

/**
 * Subscribes to a media query. The server has no viewport, so the first paint always
 * takes the `false` branch - callers must treat a match as an enhancement on top of a
 * layout that is already correct without it.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const sync = () => setMatches(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
