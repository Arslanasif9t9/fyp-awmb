import { Link } from 'react-router-dom';
import { Globe, Clock, ChevronRight } from 'lucide-react';
import type { World } from '../../types';

export const WorldCard = ({ world }: { world: World }) => {
  // Format date
  const createdDate = new Date(world.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <Link to={`/world/${world.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xs font-medium bg-background border border-border px-2.5 py-1 rounded-full text-foreground/60">
            {world.domain}
          </span>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
          {world.name}
        </h3>
        <p className="text-sm text-foreground/60 line-clamp-2 mb-4">
          {world.purpose}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-foreground/50">
            <Clock className="h-3.5 w-3.5" />
            {createdDate}
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Open <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};