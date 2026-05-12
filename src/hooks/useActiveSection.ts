import { useRef, useState, useCallback, useEffect } from 'react';

export function useActiveSection(sectionIds: string[], rootMargin = '-20% 0% -60% 0%') {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const isAutoScrollingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    isAutoScrollingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 600);
    setActiveId(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        if (isAutoScrollingRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin, threshold: 0 }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds, rootMargin]);

  return { activeId, scrollTo };
}
