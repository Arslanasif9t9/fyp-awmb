import { Link } from 'react-router-dom';
import { Ghost, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <Ghost className="h-24 w-24 text-primary" />
      </div>
      <h1 className="text-6xl font-extrabold text-foreground mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-foreground/60 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved to another dimension.
      </p>
      <Link to="/dashboard">
        <Button size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};