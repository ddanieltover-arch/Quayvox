import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
      className="relative w-full min-h-[640px] lg:min-h-screen overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0">
        <img
          src="/images/ops_center_bg.jpg"
          alt="Operations Center"
          className="w-full h-full object-cover"
        />
        {/* Fixed dark scrims — not theme tokens (navy-* flips to light gray in light mode) */}
        <div className="absolute inset-0 bg-[#070A12]/88" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070A12] via-[#070A12]/85 to-[#070A12]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-transparent to-[#070A12]/45" />
      </div>

      <div className="relative flex items-center min-h-[640px] lg:min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <h2
                ref={headlineRef}
                className="font-display font-bold text-[clamp(36px,5vw,64px)] text-white leading-[1.05] drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]"
              >
                <span className="inline-block">Built</span>{' '}
                <span className="inline-block">for</span>{' '}
                <span className="inline-block">teams</span>
                <br />
                <span className="inline-block">that</span>{' '}
                <span className="inline-block">don&apos;t</span>{' '}
                <span className="inline-block text-[#6B85F7]">sleep.</span>
              </h2>
            </div>

            <div
              ref={contentRef}
              className="rounded-2xl border border-white/20 bg-[#0B1020]/95 backdrop-blur-md p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-6">
                24/7 monitoring, SLA alerts, and on-call routing—so your ops team stays ahead.
              </p>

              <div className="flex flex-wrap gap-3 mb-7">
                {slaFeatures.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#11182B] border border-white/20"
                  >
                    <feature.icon className="w-4 h-4 text-[#6B85F7] shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-white">{feature.label}</p>
                      <p className="text-[10px] text-white/70">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/product" className="btn-primary flex items-center gap-2 min-h-11">
                  <span>Meet the platform</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 min-h-11 px-4 rounded-[14px] border border-white/30 bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>About Quayvox</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Operations;
