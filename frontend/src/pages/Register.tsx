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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      // Backend standard JSON expect kar raha hai
      const response = await api.post('/auth/register', data);
      login(response.data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex w-1/2 bg-card border-r border-border flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/10 to-primary/10 z-0"></div>
        <div className="z-10 text-center space-y-6">
          <div className="bg-accent/20 p-4 rounded-2xl inline-block mb-4 shadow-xl border border-accent/30">
            <BrainCircuit className="h-16 w-16 text-accent" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Build Your World</h1>
          <p className="text-foreground/60 text-lg max-w-md">
            Join the platform that understands context, tracks history, and never hallucinates without evidence.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold">Create an account</h2>
            <p className="text-foreground/60 mt-2">Start building your AI-powered worlds today.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input 
              label="Full Name" 
              placeholder="John Doe"
              {...register('name')}
              error={errors.name?.message}
            />
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
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/60">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};