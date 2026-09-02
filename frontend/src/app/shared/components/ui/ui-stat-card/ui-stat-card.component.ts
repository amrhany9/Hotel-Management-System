import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-stat-card.component.html',
  host: { class: 'block w-full' },
})
export class UiStatCardComponent {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() unit?: string;
  @Input() subtitle?: string;
  @Input() color: 'primary' | 'emerald' | 'amber' | 'rose' | 'indigo' = 'primary';
  @Input() trend?: 'up' | 'down' | 'neutral';
  @Input() trendValue?: string;

  get iconContainerClasses(): string {
    const map = {
      primary: 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border-primary-100/80 dark:border-primary-900/60',
      emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100/80 dark:border-emerald-900/60',
      amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100/80 dark:border-amber-900/60',
      rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100/80 dark:border-rose-900/60',
      indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100/80 dark:border-indigo-900/60',
    };
    return `w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform duration-300 group-hover:scale-110 shrink-0 ${map[this.color]}`;
  }

  get glowClass(): string {
    const map = {
      primary: 'bg-primary-500',
      emerald: 'bg-emerald-500',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
      indigo: 'bg-indigo-500',
    };
    return map[this.color];
  }

  get accentBarClasses(): string {
    const map = {
      primary: 'from-primary-500 to-indigo-500',
      emerald: 'from-emerald-500 to-teal-500',
      amber: 'from-amber-500 to-orange-500',
      rose: 'from-rose-500 to-pink-500',
      indigo: 'from-indigo-500 to-primary-500',
    };
    return `absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r opacity-90 transition-opacity ${map[this.color]}`;
  }
}
