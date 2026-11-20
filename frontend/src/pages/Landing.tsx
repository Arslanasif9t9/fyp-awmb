import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, ShieldCheck, Zap, Network, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Hero3D } from '../components/3d/Hero3D';

export const Landing = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">WorldModel AI</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Version 2.0 is now live
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Build a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Persistent World</span> from your Data.
          </h1>
          <p className="text-lg text-foreground/60 max-w-lg leading-relaxed">
            Stop talking to a chatbot that forgets. Upload mixed files, detect contradictions, and simulate "what-if" scenarios grounded strictly in evidence.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Start Building <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="https://github.com/Arslanasif9t9/fyp-awmb" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline">View Source</Button>
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl opacity-50"></div>
          <Hero3D />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-border/50">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why WorldModel AI?</h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Unlike traditional tools, our engine maintains a versioned, evidence-tagged state of your data.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors">
            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Evidence-Grounded</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Every answer comes with a citation. If the data doesn't support it, the AI says "I don't know" instead of hallucinating.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors">
            <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Network className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Contradiction-Aware</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">
              When two files disagree, we don't hide it. Our engine surfaces conflicts automatically so you can make the final call.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors">
            <div className="bg-yellow-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Append-Only History</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Nothing is ever hard-deleted. You can rewind, deactivate sources, and run "what-if" simulations without breaking your world.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};