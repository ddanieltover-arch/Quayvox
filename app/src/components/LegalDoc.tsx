import type { ReactNode } from 'react';

interface LegalSectionProps {
  index: number;
  title: string;
  children: ReactNode;
}

export const LegalSection = ({ index, title, children }: LegalSectionProps) => (
  <section className="card-surface p-5 sm:p-6 lg:p-7">
    <div className="flex items-start gap-3 sm:gap-4 mb-3">
      <span className="font-mono text-xs text-cobalt shrink-0 mt-1">
        {String(index).padStart(2, '0')}
      </span>
      <h2 className="font-display font-semibold text-lg text-text-primary leading-snug">
        {title}
      </h2>
    </div>
    <div className="sm:pl-8 text-sm text-text-secondary leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-cobalt [&_a]:hover:underline">
      {children}
    </div>
  </section>
);

interface LegalDocProps {
  lastUpdated?: string;
  children: ReactNode;
}

const LegalDoc = ({ lastUpdated, children }: LegalDocProps) => (
  <section className="px-4 sm:px-6 lg:px-8 xl:px-12 pb-20 pt-10 lg:pt-12">
    <div className="max-w-3xl mx-auto">
      {lastUpdated && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-6 border-b border-[var(--border-subtle)]">
          <p className="text-xs font-mono uppercase tracking-wider text-text-secondary">
            Last updated {lastUpdated}
          </p>
          <p className="text-xs text-text-secondary">Counsel-replaceable summary</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:gap-5">{children}</div>
    </div>
  </section>
);

export default LegalDoc;
