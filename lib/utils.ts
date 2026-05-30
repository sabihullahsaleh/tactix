import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getPlayerGradient(rating: number): string {
  if (rating >= 90) return 'from-yellow-500 to-amber-600';
  if (rating >= 85) return 'from-cyan-500 to-blue-600';
  if (rating >= 80) return 'from-green-500 to-emerald-600';
  return 'from-gray-500 to-gray-600';
}

export function getRatingColor(rating: number): string {
  if (rating >= 90) return '#f59e0b';
  if (rating >= 85) return '#00f5ff';
  if (rating >= 80) return '#39ff14';
  if (rating >= 75) return '#a3e635';
  return '#94a3b8';
}

export function getStatColor(value: number): string {
  if (value >= 90) return '#39ff14';
  if (value >= 80) return '#00f5ff';
  if (value >= 70) return '#a78bfa';
  if (value >= 60) return '#fb923c';
  return '#94a3b8';
}

export function formatMarketValue(value: string): string {
  return value;
}
