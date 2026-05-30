'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'green' | 'pink' | 'purple' | 'none';
  hover?: boolean;
  onClick?: () => void;
};

export default function GlassCard({ children, className, glow = 'none', hover = false, onClick }: GlassCardProps) {
  const glowClasses = {
    cyan: 'border-glow-cyan',
    green: 'border-glow-green',
    pink: 'border-glow-pink',
    purple: 'border border-purple-500/40 shadow-[0_0_12px_rgba(191,95,255,0.2)]',
    none: 'border border-white/8',
  };

  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -1 } : undefined}
      onClick={onClick}
      className={cn(
        'glass-card rounded-xl',
        glowClasses[glow],
        hover && 'cursor-pointer transition-all',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
