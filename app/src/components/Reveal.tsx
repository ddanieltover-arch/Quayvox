import { useRef, type HTMLAttributes, type ReactNode } from 'react';
import { useGsapReveal, type UseGsapRevealOptions } from '@/hooks/useGsapReveal';

type RevealProps = UseGsapRevealOptions & {
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>;

/**
 * Presentation wrapper: fade/slide children into view on scroll (once).
 * Honors prefers-reduced-motion via useGsapReveal.
 */
const Reveal = ({
  children,
  className,
  staggerSelector,
  stagger,
  delay,
  start,
  y,
  duration,
  ...rest
}: RevealProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useGsapReveal(ref, { staggerSelector, stagger, delay, start, y, duration });

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
};

export default Reveal;
