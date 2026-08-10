import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import ContactDetailsCard from '@/components/ContactDetailsCard';

gsap.registerPlugin(ScrollTrigger);

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Valid email required'),
  company: z.string().trim().max(160).optional(),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(5000),
  website: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

const CTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', company: '', message: '', website: '' },
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { x: '-4vw', opacity: 0 },
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

      gsap.fromTo(
        cardRef.current,
        { x: '6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

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

  const onSubmit = async (values: ContactForm) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      setSent(true);
      reset();
      toast.success(
        data.emailSent === false
          ? 'Message saved. Email delivery is not configured yet.'
          : 'Message sent — we will get back to you soon.'
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="relative w-full bg-navy-900 pt-20 lg:pt-32">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 mb-20">
          <div ref={contentRef} className="lg:pr-12">
            <h2 className="font-display font-bold text-[clamp(32px,4vw,56px)] text-text-primary leading-tight mb-6">
              Start shipping smarter.
            </h2>
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8">
              Global shipping with branches on every continent. Tell us about your lanes —
              we&apos;ll follow up.
            </p>

            <ContactDetailsCard className="mb-8" />

            <Link to="/login" className="btn-secondary inline-flex items-center gap-2 min-h-11">
              <span>Admin login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div ref={cardRef} className="card-surface p-5 sm:p-6 lg:p-8 lg:max-w-md lg:ml-auto">
            <h3 className="font-display font-semibold text-xl text-text-primary mb-2">
              Talk to sales
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              {sent ? 'Thanks — your message is in.' : 'Send a note and we will reply by email.'}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
                {...register('website')}
              />

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
                  Name
                </label>
                <input
                  className="w-full min-h-11 px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cobalt/50"
                  {...register('name')}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full min-h-11 px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cobalt/50"
                  {...register('email')}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
                  Company
                </label>
                <input
                  className="w-full min-h-11 px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cobalt/50"
                  {...register('company')}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cobalt/50 resize-y min-h-[7rem]"
                  {...register('message')}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full min-h-11 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <footer ref={footerRef} className="border-t border-white/5 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-sm text-text-secondary">Privacy</span>
              <span className="text-sm text-text-secondary">Terms</span>
              <span className="text-sm text-text-secondary">Security</span>
            </div>
            <p className="text-xs text-text-secondary">© 2026 Quayvox. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default CTA;
