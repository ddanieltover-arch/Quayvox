import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Valid email required'),
  company: z.string().trim().max(160).optional(),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(5000),
  website: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const ContactForm = ({
  title = 'Talk to sales',
  subtitle = 'Send a note and we will reply by email.',
  className = '',
}: ContactFormProps) => {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', company: '', message: '', website: '' },
  });

  const onSubmit = async (values: ContactFormValues) => {
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
    <div className={`card-surface p-5 sm:p-6 lg:p-8 ${className}`}>
      <h3 className="font-display font-semibold text-xl text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary mb-6">
        {sent ? 'Thanks — your message is in.' : subtitle}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
          {...register('website')}
        />

        <div>
          <label className="block text-xs font-mono uppercase text-text-secondary mb-2">Name</label>
          <input
            className="w-full min-h-11 px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cobalt/50"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-text-secondary mb-2">Email</label>
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
          {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
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
  );
};

export default ContactForm;
