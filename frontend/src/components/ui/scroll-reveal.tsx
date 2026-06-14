"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered animation wrapper using IntersectionObserver.
 *
 * Wraps children and fades them in with an up-slide when they scroll into view.
 * Respects `prefers-reduced-motion` — animations are skipped entirely.
 *
 * @example
 *   <ScrollReveal>
 *     <KpiCard title="Revenue" value="$48K" />
 *   </ScrollReveal>
 *
 *   <ScrollReveal animation="scale-in" delay={60}>
 *     <Card>Delayed scale reveal</Card>
 *   </ScrollReveal>
 */
interface ScrollRevealProps {
  children: ReactNode;
  /** Animation class suffix: "slide-up" (default), "fade-in", "slide-down", "scale-in" */
  animation?: "slide-up" | "fade-in" | "slide-down" | "scale-in";
  /** Delay in ms before animation starts */
  delay?: number;
  /** Additional class names */
  className?: string;
  /** IntersectionObserver root margin (default: "60px 0px") */
  rootMargin?: string;
}

export function ScrollReveal({
  children,
  animation = "slide-up",
  delay = 0,
  className,
  rootMargin = "60px 0px",
}: ScrollRevealProps) {
  const isReducedMotion = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    []
  );
  const ref = useRef<HTMLDivElement>(null);
  const observedRef = useRef(false);
  const [visible, setVisible] = useState(isReducedMotion);

  useEffect(() => {
    if (observedRef.current) return;
    observedRef.current = true;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { rootMargin, threshold: 0.05 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={cn(
        visible && `animate-hc-${animation}`,
        className
      )}
      style={{
        opacity: visible ? undefined : 0,
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}
