import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import PageHero from '@/components/PageHero';
import PageCta from '@/components/PageCta';
import { getSolutionBySlug, solutions, getSolutionPath } from '@/data/solutions';

const SolutionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const solution = slug ? getSolutionBySlug(slug) : undefined;

  if (!solution) {
    return <Navigate to="/solutions" replace />;
  }

  const related = solutions.filter((s) => s.slug !== solution.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={solution.eyebrow}
        title={solution.heroTitle}
        description={solution.heroDescription}
        image={solution.image}
        imageAlt={solution.imageAlt}
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2 min-h-11">
            Discuss this solution
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/solutions" className="btn-secondary inline-flex items-center gap-2 min-h-11">
            All solutions
          </Link>
        </div>
      </PageHero>

      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="max-w-3xl space-y-4 text-text-secondary leading-relaxed">
          <p className="eyebrow mb-3">OVERVIEW</p>
          <h2 className="font-display font-bold text-2xl text-text-primary mb-4">
            Why teams choose Quayvox for {solution.title.toLowerCase()}
          </h2>
          {solution.overview.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16 border-t border-white/5">
        <p className="eyebrow mb-3">CAPABILITIES</p>
        <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
          What you get on this lane
        </h2>
        <p className="text-sm text-text-secondary mb-8 max-w-xl leading-relaxed">
          Practical visibility and workflows built around how {solution.title.toLowerCase()} actually
          moves.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {solution.capabilities.map((item) => (
            <div key={item.title} className="card-surface p-5 sm:p-6">
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16 border-t border-white/5">
        <p className="eyebrow mb-3">OUTCOMES</p>
        <h2 className="font-display font-bold text-2xl text-text-primary mb-8">
          Results ops teams care about
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solution.outcomes.map((item) => (
            <div key={item.label}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cobalt/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-cobalt" />
                </div>
                <h3 className="font-display font-semibold text-base text-text-primary">
                  {item.label}
                </h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed pl-11">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16 border-t border-white/5">
        <p className="eyebrow mb-3">HOW IT WORKS</p>
        <h2 className="font-display font-bold text-2xl text-text-primary mb-8">
          A simple path to live visibility
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {solution.workflows.map((item, index) => (
            <div key={item.title}>
              <p className="font-mono text-xs text-cobalt mb-3">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16 border-t border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow mb-3">MORE SOLUTIONS</p>
            <h2 className="font-display font-bold text-2xl text-text-primary">
              Explore related lanes
            </h2>
          </div>
          <Link
            to="/solutions"
            className="btn-secondary inline-flex items-center gap-2 min-h-11 self-start"
          >
            See all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {related.map((item) => (
            <Link
              key={item.slug}
              to={getSolutionPath(item.slug)}
              className="card-surface p-5 sm:p-6 group hover:border-cobalt/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-cobalt" />
              </div>
              <h3 className="font-display font-semibold text-base text-text-primary mb-1 group-hover:text-cobalt transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary">{item.cardDescription}</p>
            </Link>
          ))}
        </div>
      </section>

      <PageCta
        title={solution.ctaTitle}
        description={solution.ctaDescription}
        primary={{ label: 'Contact sales', to: '/contact' }}
        secondary={{ label: 'View pricing', to: '/pricing' }}
      />
    </>
  );
};

export default SolutionDetail;
