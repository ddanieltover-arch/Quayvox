import { useEffect, useRef } from 'react';
import { Quote } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '2.4M', label: 'Shipments tracked monthly' },
  { value: '99.97%', label: 'Uptime SLA' },
  { value: '<120s', label: 'Average support response' },
];

const testimonials = [
  {
    quote: 'We cut ETA disputes by 70%.',
    author: 'Logistics Lead',
    company: 'Retail Brand',
  },
  {
    quote: 'Our planners actually trust the data now.',
    author: 'VP Ops',
    company: 'Manufacturer',
  },
  {
    quote: 'Onboarding took a day, not a quarter.',
    author: 'Head of Supply Chain',
    company: 'Pharma',
  },
];

const Stats = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stats entrance
      const statItems = statsRef.current?.querySelectorAll('.stat-item');
      if (statItems && statItems.length > 0) {
        gsap.fromTo(
          statItems,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Testimonial cards
      const testimonialCards = cardsRef.current?.querySelectorAll('.testimonial-card');
      if (testimonialCards && testimonialCards.length > 0) {
        gsap.fromTo(
          testimonialCards,
          { y: 40, scale: 0.98, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="relative w-full bg-navy-800 py-20 lg:py-32"
    >
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Stats Row */}
        <div
          ref={statsRef}
          className="flex flex-wrap justify-center gap-8 lg:gap-16 mb-16 lg:mb-24"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item text-center">
              <p className="font-display font-bold text-[clamp(36px,5vw,56px)] text-cobalt mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="eyebrow mb-4 block">TESTIMONIALS</span>
          <h2 className="font-display font-bold text-[clamp(28px,3vw,44px)] text-text-primary">
            Trusted by logistics teams worldwide.
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.quote}
              className="testimonial-card card-surface p-6 lg:p-8 transition-all duration-500 hover:shadow-glow"
            >
              <Quote className="w-8 h-8 text-cobalt/40 mb-4" />
              <p className="font-display font-semibold text-xl text-text-primary mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cobalt/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-cobalt">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-text-secondary">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
