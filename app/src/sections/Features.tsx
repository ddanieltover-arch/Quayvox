import { useEffect, useRef } from 'react';
import { Radar, Route, FileCheck } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Radar,
    title: 'Real-time tracking',
    description: 'GPS, AIS, and carrier updates unified into a single timeline.',
    image: '/images/feature_tracking.jpg',
  },
  {
    icon: Route,
    title: 'Route optimization',
    description: 'ML-powered suggestions that cut fuel, time, and emissions.',
    image: '/images/feature_optimization.jpg',
  },
  {
    icon: FileCheck,
    title: 'Customs & docs',
    description: 'Auto-generated paperwork, duties, and audit trails.',
    image: '/images/feature_compliance.jpg',
  },
];

const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Container entrance
      gsap.fromTo(
        sectionRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 45%',
            scrub: true,
          },
        }
      );

      // Cards staggered entrance
      cardsRef.current.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 40, scale: 0.98, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.08,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Parallax on image
        const img = card.querySelector('img');
        if (img) {
          gsap.fromTo(
            img,
            { y: -12 },
            {
              y: 12,
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative w-full bg-navy-900 py-20 lg:py-32"
    >
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="eyebrow mb-4 block">CAPABILITIES</span>
          <h2 className="font-display font-bold text-[clamp(28px,3vw,44px)] text-text-primary">
            Three pillars. Zero blind spots.
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="group card-surface overflow-hidden transition-all duration-500 hover:shadow-glow animate-float"
              style={{ animationDelay: `${index * 0.5}s` }}
            >
              {/* Image Area */}
              <div className="relative h-48 lg:h-56 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-700/80 to-transparent" />
                
                {/* L-shaped accent */}
                <div className="absolute bottom-4 left-4 w-8 h-8">
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cobalt" />
                  <div className="absolute bottom-0 left-0 w-0.5 h-full bg-cobalt" />
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-cobalt" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-text-primary">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
