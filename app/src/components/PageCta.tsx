import { Link } from 'react-router-dom';

interface PageCtaLink {
  label: string;
  to: string;
  variant?: 'primary' | 'secondary';
}

interface PageCtaProps {
  title: string;
  description: string;
  primary: PageCtaLink;
  secondary?: PageCtaLink;
}

const PageCta = ({ title, description, primary, secondary }: PageCtaProps) => (
  <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16 border-t border-white/5">
    <div className="card-surface p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="font-display font-semibold text-xl text-text-primary mb-1">{title}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          to={primary.to}
          className={`${primary.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'} min-h-11 inline-flex items-center`}
        >
          {primary.label}
        </Link>
        {secondary && (
          <Link
            to={secondary.to}
            className={`${secondary.variant === 'primary' ? 'btn-primary' : 'btn-secondary'} min-h-11 inline-flex items-center`}
          >
            {secondary.label}
          </Link>
        )}
      </div>
    </div>
  </section>
);

export default PageCta;
