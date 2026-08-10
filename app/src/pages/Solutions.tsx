import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Network from '@/sections/Network';
import Operations from '@/sections/Operations';
import { solutions, getSolutionPath } from '@/data/solutions';

const Solutions = () => (
  <>
    <PageHero
      eyebrow="SOLUTIONS"
      title="Built for how freight actually moves."
      description="Whether you run ocean lanes, air express, or multi-modal networks — Quayvox adapts to your modes and industries."
      image="/images/global_cargo_plane.jpg"
      imageAlt="Global air cargo network"
    >
      <Link to="/contact" className="btn-primary inline-flex items-center gap-2 min-h-11">
        Discuss your lanes
        <ArrowRight className="w-4 h-4" />
      </Link>
    </PageHero>

    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {solutions.map((item) => (
          <Link
            key={item.slug}
            to={getSolutionPath(item.slug)}
            className="card-surface p-5 sm:p-6 group hover:border-cobalt/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center mb-4">
              <item.icon className="w-5 h-5 text-cobalt" />
            </div>
            <h2 className="font-display font-semibold text-lg text-text-primary mb-2 group-hover:text-cobalt transition-colors">
              {item.title}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">{item.cardDescription}</p>
            <span className="inline-flex items-center gap-1.5 text-sm text-cobalt">
              Learn more
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>

    <Network />
    <Operations />
  </>
);

export default Solutions;
