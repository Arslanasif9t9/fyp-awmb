import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { BrainCircuit } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Backend OAuth2PasswordRequestForm expect kar raha hai
      const formData = new URLSearchParams();
      formData.append('username', data.email); // backend mein username matlab email
      formData.append('password', data.password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      login(response.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-card border-r border-border flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 z-0"></div>
        <div className="z-10 text-center space-y-6">
          <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4 shadow-xl border border-primary/30">
            <BrainCircuit className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">AI World Model Builder</h1>
          <p className="text-foreground/60 text-lg max-w-md">
            Turn scattered information into a persistent, evidence-grounded world. Ask questions, detect contradictions, and simulate the future.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold">Sign in</h2>
            <p className="text-foreground/60 mt-2">Enter your details to access your worlds.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />
            
            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};