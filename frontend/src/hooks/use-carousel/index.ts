/**
 * @file src/hooks/use-carousel.ts
 */

import { useCallback, useEffect, useState } from "react";

interface UseCarouselOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  count: number;
}

interface UseCarouselResult {
  goTo: (i: number) => void;
  goNext: () => void;
  goPrev: () => void;
  index: number;
}

const useCarousel = ({
  containerRef,
  count,
}: UseCarouselOptions): UseCarouselResult => {
  const [index, setIndex] = useState(0);

  const goNext = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  const goPrev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  );

  const goTo = useCallback((i: number) => setIndex(i), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, containerRef]);

  return { index, goNext, goPrev, goTo };
};

export default useCarousel;
