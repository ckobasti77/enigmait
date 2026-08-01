import { useCallback, useEffect, useState } from "react";

type IntersectionParams = {
  rootMargin?: string;
  threshold?: number | number[];
};

export function useIntersectionActive<T extends HTMLElement>({
  rootMargin = "0px",
  threshold = 0.1,
}: IntersectionParams = {}) {
  const [node, setNode] = useState<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, rootMargin, threshold]);

  const ref = useCallback((element: T | null) => {
    setNode(element);
  }, []);

  return { ref, isIntersecting };
}

