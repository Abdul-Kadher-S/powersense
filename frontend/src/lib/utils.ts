import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatKwh(kwh: number): string {
  return `${kwh.toFixed(0)} kWh`
}

export function getMonthName(month: number): string {
  const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return names[month] || String(month)
}

export function getFullMonthName(month: number): string {
  const names = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return names[month] || String(month)
}

export function getRiskColor(risk: string): string {
  switch (risk?.toLowerCase()) {
    case 'high risk':
    case 'critical':
    case 'high':
      return 'text-red-500'
    case 'moderate risk':
    case 'moderate':
    case 'warning':
      return 'text-amber-500'
    case 'healthy':
    case 'low':
    case 'normal':
    case 'info':
      return 'text-emerald-500'
    default:
      return 'text-slate-500'
  }
}

export function getRiskBgColor(risk: string): string {
  switch (risk?.toLowerCase()) {
    case 'high risk':
    case 'critical':
    case 'high':
      return 'bg-red-500/10 border-red-500/20'
    case 'moderate risk':
    case 'moderate':
    case 'warning':
      return 'bg-amber-500/10 border-amber-500/20'
    case 'healthy':
    case 'low':
    case 'normal':
    case 'info':
      return 'bg-emerald-500/10 border-emerald-500/20'
    default:
      return 'bg-slate-500/10 border-slate-500/20'
  }
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return '#10b981' // emerald
  if (score >= 60) return '#f59e0b' // amber
  return '#ef4444' // red
}

export function getPriorityIcon(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'high': return '🔴'
    case 'moderate': return '🟠'
    case 'low': return '🟢'
    case 'info': return '🔵'
    default: return '⚪'
  }
}
