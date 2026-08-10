import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PageHero from '@/components/PageHero';
import PageCta from '@/components/PageCta';

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'for 14 days',
    description: 'Evaluate tracking and the ops dashboard on a small book of business.',
    features: ['Up to 50 active shipments', 'Public track pages', 'Email support', 'CSV export'],
    cta: 'Start free',
    to: '/contact',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$299',
    period: '/month',
    description: 'For growing freight teams that need live control and status alerts.',
    features: [
      'Unlimited shipments',
      'Status email notifications',
      'Admin roles & audit trail',
      'Priority support',
      'API access (roadmap)',
    ],
    cta: 'Talk to sales',
    to: '/contact',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Multi-brand networks, SLAs, and dedicated onboarding.',
    features: [
      'SSO & custom roles',
      'Dedicated success manager',
      'Custom integrations',
      'Uptime SLA',
      'On-prem options on request',
    ],
    cta: 'Contact us',
    to: '/contact',
    highlighted: false,
  },
];

const faqs = [
  {
    q: 'Can we start without a long contract?',
    a: 'Yes. Starter is a short evaluation; Pro and Enterprise are month-to-month until you prefer annual.',
  },
  {
    q: 'Do customers need accounts to track?',
    a: 'No. Anyone with a tracking number can use the public track page.',
  },
  {
    q: 'How does billing work for Pro?',
    a: 'We invoice monthly after onboarding. Volume discounts are available on Enterprise.',
  },
];

const Pricing = () => {
  const plansRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pricing-card',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: plansRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, plansRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <PageHero
        eyebrow="PRICING"
        title="Simple plans for every stage."
        description="Start with a short evaluation, then scale into Pro or Enterprise as your network grows."
        image="/images/feature_optimization.jpg"
        imageAlt="Route optimization overview"
      >
        <Link to="/contact" className="btn-primary inline-flex items-center gap-2 min-h-11">
          Talk to sales
          <ArrowRight className="w-4 h-4" />
        </Link>
      </PageHero>

      <section ref={plansRef} className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card card-surface p-6 sm:p-8 flex flex-col ${
                plan.highlighted ? 'border-cobalt/40 ring-1 ring-cobalt/30' : ''
              }`}
            >
              {plan.highlighted && (
                <span className="text-xs font-mono uppercase text-cobalt mb-3">Most popular</span>
              )}
              <h2 className="font-display font-semibold text-xl text-text-primary mb-1">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="font-display font-bold text-3xl text-text-primary">{plan.price}</span>
                {plan.period && <span className="text-sm text-text-secondary">{plan.period}</span>}
              </div>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">{plan.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-primary">
                    <Check className="w-4 h-4 text-cobalt shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.to}
                className={`${plan.highlighted ? 'btn-primary' : 'btn-secondary'} inline-flex items-center justify-center gap-2 min-h-11`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 pb-8 border-t border-white/5 pt-12">
        <h2 className="font-display font-bold text-2xl text-text-primary mb-8">FAQ</h2>
        <div className="space-y-6 max-w-3xl">
          {faqs.map((item) => (
            <div key={item.q}>
              <h3 className="font-medium text-text-primary mb-2">{item.q}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link to="/login" className="text-sm text-cobalt hover:underline">
            Already a customer? Admin login →
          </Link>
        </div>
      </section>

      <PageCta
        title="Need a custom quote?"
        description="Tell us about volume, modes, and integrations — we’ll map the right plan."
        primary={{ label: 'Contact sales', to: '/contact' }}
        secondary={{ label: 'See product', to: '/product' }}
      />
    </>
  );
};

export default Pricing;
