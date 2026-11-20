import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { X, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../lib/api';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  domain: z.enum(['general', 'news_incident', 'city_traffic']), // Backend limits
  purpose: z.string().min(3, 'Purpose must be at least 3 characters'),
});

type FormData = z.infer<typeof schema>;

interface CreateWorldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateWorldModal = ({ isOpen, onClose, onSuccess }: CreateWorldModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      domain: 'general' // Default value
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await api.post('/worlds', data);
      toast.success('World created successfully!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      let errorMessage = 'Failed to create world';
      
      // 422 Error ko safely handle karo (Screen black hone se bachao)
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md p-6 rounded-2xl border border-border shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className="bg-primary/20 p-3 rounded-xl inline-block mb-4">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Create New World</h2>
          <p className="text-foreground/60 text-sm mt-1">
            Define the purpose and domain to start building your AI model.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="World Name"
            placeholder="e.g. Pakistan Energy Sector 2026"
            {...register('name')}
            error={errors.name?.message}
          />
          
          {/* Domain Dropdown */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Domain</label>
            <select
              {...register('domain')}
              className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            >
              <option value="general">General</option>
              <option value="news_incident">News / Incident</option>
              <option value="city_traffic">City Traffic</option>
            </select>
            {errors.domain && <span className="text-xs text-red-500">{errors.domain.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Purpose</label>
            <textarea
              placeholder="What do you want to achieve with this world?"
              {...register('purpose')}
              className="flex min-h-[80px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 resize-none"
            />
            {errors.purpose && <span className="text-xs text-red-500">{errors.purpose.message}</span>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              Create World
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};