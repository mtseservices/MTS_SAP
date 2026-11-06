import React from 'react';
import { Plus, LucideIcon } from 'lucide-react';

export interface CreateNewActionButtonProps {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'emerald' | 'amber' | 'cyan' | 'blue' | 'primary';
  disabled?: boolean;
  className?: string;
  shortcutHint?: string;
}

export const CreateNewActionButton: React.FC<CreateNewActionButtonProps> = ({
  label,
  onClick,
  icon: Icon = Plus,
  variant = 'primary',
  disabled = false,
  className = '',
  shortcutHint
}) => {
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 text-white',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 text-white',
    amber: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 text-white',
    cyan: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30 text-white',
    blue: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 text-white'
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      title={`${label}${shortcutHint ? ` (${shortcutHint})` : ''}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
      {shortcutHint && (
        <span className="hidden sm:inline-block text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono">
          {shortcutHint}
        </span>
      )}
    </button>
  );
};
