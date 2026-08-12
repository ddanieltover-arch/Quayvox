import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type UseGsapRevealOptions = {
  /** CSS selector for children to stagger; omit to animate the container itself */
  staggerSelector?: string;
  /** Stagger delay between children in seconds (default 0.06) */
  stagger?: number;
  /** Extra delay before the reveal starts (seconds) */
  delay?: number;
  /** ScrollTrigger start (default 'top 85%') */
  start?: string;
  /** Vertical travel in px (default 24) */
  y?: number;
  /** Duration in seconds (default 0.55) */
  duration?: number;
};

/**
 * Scroll-triggered fade/slide reveal. Animates opacity + y only.
 * No-ops when prefers-reduced-motion is set. Plays once (no reverse on scroll up).
 */
export function useGsapReveal(
  ref: RefObject<HTMLElement | null>,
  {
    staggerSelector,
    stagger = 0.06,
    delay = 0,
    start = 'top 85%',
    y = 24,
    duration = 0.55,
  }: UseGsapRevealOptions = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const targets = staggerSelector
      ? el.querySelectorAll<HTMLElement>(staggerSelector)
      : [el];

    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration,
        delay,
        stagger: staggerSelector ? stagger : 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: 'play none none none',
        },
      });
    }, el);

    return () => ctx.revert();
  }, [ref, staggerSelector, stagger, delay, start, y, duration]);
}
