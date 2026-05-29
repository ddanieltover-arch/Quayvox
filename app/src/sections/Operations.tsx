import { useEffect, useRef } from 'react';
import { ArrowRight, BookOpen, Headphones, Clock, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const slaFeatures = [
  { icon: Clock, label: '24/7 Monitoring', desc: 'Always watching' },
  { icon: Shield, label: '99.97% Uptime', desc: 'Enterprise SLA' },
  { icon: Headphones, label: '< 2min Response', desc: 'Support team' },
];

const Operations = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background parallax
      gsap.fromTo(
        bgRef.current,
        { scale: 1.06, y: 0 },
        {
          scale: 1,
          y: -20,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            end: 'top 20%',
            scrub: true,
          },
        }
      );

      // Headline words stagger
      const words = headlineRef.current?.querySelectorAll('span');
      if (words) {
        gsap.fromTo(
          words,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.02,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Right content
      gsap.fromTo(
        contentRef.current,
        { x: '6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen min-h-[600px] overflow-hidden"
    >
      {/* Full-bleed Background */}
      <div ref={bgRef} className="absolute inset-0">
        <img
          src="/images/ops_center_bg.jpg"
          alt="Operations Center"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-900/72" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Headline */}
            <div>
              <h2
                ref={headlineRef}
                className="font-display font-bold text-[clamp(36px,5vw,64px)] text-text-primary leading-[1.05]"
              >
                <span className="inline-block">Built</span>{' '}
                <span className="inline-block">for</span>{' '}
                <span className="inline-block">teams</span>
                <br />
                <span className="inline-block">that</span>{' '}
                <span className="inline-block">don't</span>{' '}
                <span className="inline-block text-cobalt">sleep.</span>
              </h2>
            </div>

            {/* Right Content */}
            <div ref={contentRef} className="lg:pl-12">
              <p className="text-lg text-text-secondary leading-relaxed mb-8">
                24/7 monitoring, SLA alerts, and on-call routing—so your ops team
                stays ahead.
              </p>

              {/* SLA Features */}
              <div className="flex flex-wrap gap-4 mb-8">
                {slaFeatures.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-900/60 border border-white/10"
                  >
                    <feature.icon className="w-4 h-4 text-cobalt" />
                    <div>
                      <p className="text-xs font-mono text-text-primary">{feature.label}</p>
                      <p className="text-[10px] text-text-secondary">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <button className="btn-primary flex items-center gap-2">
                  <span>Meet the platform</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Read the docs</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Operations;
