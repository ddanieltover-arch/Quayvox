import { useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left content
      gsap.fromTo(
        contentRef.current,
        { x: '-6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Contact card
      gsap.fromTo(
        cardRef.current,
        { x: '8vw', opacity: 0, rotate: 1 },
        {
          x: 0,
          opacity: 1,
          rotate: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Footer
      gsap.fromTo(
        footerRef.current,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 95%',
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
      id="contact"
      className="relative w-full bg-navy-900 pt-20 lg:pt-32"
    >
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 mb-20">
          {/* Left Content */}
          <div ref={contentRef} className="lg:pr-12">
            <h2 className="font-display font-bold text-[clamp(36px,4vw,56px)] text-text-primary leading-tight mb-6">
              Start shipping smarter.
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              Get started free. No setup fees. No mandatory calls.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button className="btn-primary flex items-center gap-2">
                <span>Create account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Talk to sales</span>
              </button>
            </div>
          </div>

          {/* Right Contact Card */}
          <div
            ref={cardRef}
            className="card-surface p-6 lg:p-8 lg:max-w-md lg:ml-auto"
          >
            <h3 className="font-display font-semibold text-xl text-text-primary mb-6">
              Questions? We're here.
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-cobalt" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-0.5">Email</p>
                  <p className="text-sm text-text-primary">hello@shiptrack.example</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-cobalt" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-0.5">Phone</p>
                  <p className="text-sm text-text-primary">+1 (555) 014-2200</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-cobalt" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-0.5">Address</p>
                  <p className="text-sm text-text-primary">
                    1200 Harbor Blvd, Suite 500
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          ref={footerRef}
          className="border-t border-white/5 py-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Security
              </a>
            </div>
            <p className="text-xs text-text-secondary">
              © 2026 ShipTrack. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default CTA;
