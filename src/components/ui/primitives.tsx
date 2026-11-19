import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56B9E8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-[#151515] text-white hover:bg-[#2A2A2A] shadow-xs',
        cyan: 'bg-[#56B9E8] text-[#151515] hover:bg-[#43A8D8] shadow-xs',
        yellow: 'bg-[#F5D84C] text-[#151515] hover:bg-[#E7C938] shadow-xs',
        outline: 'border border-[#D8D8D3] bg-white text-[#151515] hover:bg-[#F7F7F4]',
        outlineDark: 'border border-white/20 bg-transparent text-white hover:bg-white/10',
        ghost: 'text-[#151515] hover:bg-[#E9E9E6]/60',
        destructive: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-6 text-sm',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = 'Button';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#E9E9E6] bg-white text-[#151515] shadow-[0_1px_2px_rgba(21,21,21,0.04)]',
        className
      )}
      {...props}
    />
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-lg border border-[#DCDCD7] bg-white px-3.5 py-2 text-sm text-[#151515] placeholder:text-[#70849A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56B9E8] focus-visible:border-[#56B9E8] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[100px] w-full rounded-lg border border-[#DCDCD7] bg-white px-3.5 py-2.5 text-sm text-[#151515] placeholder:text-[#70849A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56B9E8] focus-visible:border-[#56B9E8] disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-11 w-full rounded-lg border border-[#DCDCD7] bg-white px-3.5 py-2 text-sm text-[#151515] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56B9E8] focus-visible:border-[#56B9E8] disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Select.displayName = 'Select';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('block text-xs font-semibold text-[#151515] mb-1.5', className)}
      {...props}
    />
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-2xl',
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#151515]/75 p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full rounded-2xl bg-white border border-[#E9E9E6] shadow-2xl overflow-hidden my-8',
          maxWidthClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9E9E6]">
          <h3 className="font-display text-lg font-bold text-[#151515] truncate pr-4">
            {title || 'Détails'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-[#70849A] hover:bg-[#F7F7F4] hover:text-[#151515] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
