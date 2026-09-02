import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-badge.component.html',
})
export class UiBadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() dot = false;
  @Input() pulse = false;

  get badgeClasses(): string {
    const base =
      'inline-flex items-center font-semibold rounded-md border leading-none transition-colors select-none';

    const sizes = {
      sm: 'px-2.5 py-0.5 text-[11px] gap-1.5',
      md: 'px-3 py-1 text-xs gap-1.5',
    };

    const variants = {
      success:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30',
      warning:
        'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30',
      danger:
        'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30',
      info:
        'bg-primary-500/10 text-primary-700 dark:text-primary-400 border-primary-500/20 dark:border-primary-500/30',
      neutral:
        'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20 dark:border-slate-700',
    };

    return `${base} ${sizes[this.size]} ${variants[this.variant]}`;
  }

  get dotColor(): string {
    const dots = {
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-rose-500',
      info: 'bg-primary-500',
      neutral: 'bg-slate-400',
    };
    return dots[this.variant];
  }
}
