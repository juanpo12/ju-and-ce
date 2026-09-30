import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Une clases y resuelve choques de Tailwind: `cn('px-2', 'px-4')` → `px-4`. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
