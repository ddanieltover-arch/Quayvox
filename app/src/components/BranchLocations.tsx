import { Globe } from 'lucide-react';
import { BRANCHES } from '@/lib/contact';

type BranchLocationsProps = {
  /** Compact for contact sidebars; expanded for About */
  variant?: 'compact' | 'grid';
};

const BranchLocations = ({ variant = 'compact' }: BranchLocationsProps) => {
  if (variant === 'grid') {
    return (
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {BRANCHES.map((branch) => (
          <li key={branch.country} className="border-b border-white/10 pb-3">
            <p className="font-display font-semibold text-text-primary">{branch.country}</p>
            <p className="text-xs text-text-secondary mt-0.5">{branch.continent}</p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
        <Globe className="w-5 h-5 text-cobalt" />
      </div>
      <div>
        <p className="text-xs text-text-secondary mb-1">Global branches</p>
        <p className="text-sm text-text-primary leading-relaxed">
          {BRANCHES.map((b) => b.country).join(' · ')}
        </p>
        <p className="text-xs text-text-secondary mt-1.5">Branches across every continent</p>
      </div>
    </div>
  );
};

export default BranchLocations;
