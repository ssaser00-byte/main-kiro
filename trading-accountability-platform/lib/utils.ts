import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatR(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}R`
}

export function calculateDuration(entryTime: Date, exitTime: Date): number {
  return Math.floor((exitTime.getTime() - entryTime.getTime()) / 1000 / 60)
}
