import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  children?: ReactNode;
}

const PageHero = ({
  eyebrow,
  title,
  description,
  image,
  imageAlt = '',
  children,
}: PageHeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo(
        '.page-hero-media',
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.9 }
      )
        .fromTo('.page-hero-eyebrow', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.5 }, 0.25)
        .fromTo('.page-hero-title', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55 }, 0.35)
        .fromTo('.page-hero-desc', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.5)
        .fromTo('.page-hero-actions', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.6);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[42vh] lg:min-h-[52vh] w-full overflow-hidden flex flex-col justify-end"
    >
      <div className="page-hero-media absolute inset-0">
        <img src={image} alt={imageAlt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/75 to-navy-900/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 via-navy-900/40 to-transparent" />
      </div>

      <div className="relative z-10 pt-28 lg:pt-36 pb-10 lg:pb-14 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-3xl">
          {eyebrow && <p className="page-hero-eyebrow eyebrow mb-4">{eyebrow}</p>}
          <h1 className="page-hero-title font-display font-bold text-[clamp(32px,4vw,48px)] text-text-primary leading-tight mb-4">
            {title}
          </h1>
          <p className="page-hero-desc text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
            {description}
          </p>
          {children && <div className="page-hero-actions mt-6 sm:mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
