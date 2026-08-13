import { useCallback, useEffect, useRef, useState } from "react";

/**
 * False dok element ne uđe u kadar, i tačno od tog trenutka zauvek true.
 *
 * Zašto ne `useIntersectionActive`: taj hook prati stanje i vraća `false` čim
 * element izađe iz kadra, što je tačno ono što ovde ne valja. Vrednost koja ide
 * samo false → true, a koristi se da nešto MONTIRA (sliku, iframe, tešku
 * podkomponentu), ne sme da se vraća — inače se isti fajl povlači ponovo pri
 * svakom prolasku gore-dole. Uz to: šest klastera koji se re-renderuju na svaki
 * ulazak i izlazak iz kadra je renderovanje bez ijedne promene na ekranu.
 *
 * Observer se gasi na prvom preseku, pa posle njega ne košta ništa.
 */
export function useInViewOnce<T extends HTMLElement>({
  rootMargin = "0px",
}: { rootMargin?: string } = {}) {
  const [node, setNode] = useState<T | null>(null);
  const [seen, setSeen] = useState(false);
  /** Čita se u efektu bez ponovnog vezivanja observera kad `seen` postane true. */
  const seenRef = useRef(false);

  useEffect(() => {
    if (!node || seenRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        seenRef.current = true;
        setSeen(true);
        observer.disconnect();
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, rootMargin]);

  const ref = useCallback((element: T | null) => {
    setNode(element);
  }, []);

  return { ref, seen };
}
