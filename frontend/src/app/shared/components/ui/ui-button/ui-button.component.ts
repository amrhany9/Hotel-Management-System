import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-button.component.html',
})
export class UiButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() customClass = '';

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const scalePress = this.variant !== 'ghost' ? 'active:scale-[0.98]' : '';
    const base =
      `inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer ${scalePress}`;

    const sizes = {
      xs: 'h-7 px-2.5 text-[11px] font-semibold gap-1 rounded-lg',
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-11 px-4 text-sm font-medium gap-2',
      lg: 'h-12 px-6 text-base font-semibold gap-2.5',
    };

    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm shadow-primary-600/25 hover:shadow-md hover:shadow-primary-600/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] focus-visible:ring-primary-500',
      secondary:
        'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 focus-visible:ring-slate-400',
      danger:
        'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-600/25 hover:shadow-md hover:shadow-rose-600/30 focus-visible:ring-rose-500',
      success:
        'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-600/25 hover:shadow-md hover:shadow-emerald-600/30 focus-visible:ring-emerald-500',
      outline:
        'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus-visible:ring-primary-500 shadow-2xs',
      ghost:
        'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:ring-slate-400',
    };

    const width = this.fullWidth ? 'w-full' : '';

    return `${base} ${sizes[this.size]} ${variants[this.variant]} ${width} ${this.customClass}`.trim();
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
