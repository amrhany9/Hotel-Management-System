import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-card.component.html',
  host: { class: 'block w-full' },
})
export class UiCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() interactive = false;
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() hasHeaderAction = false;
  @Input() accentColor?: 'primary' | 'emerald' | 'amber' | 'rose';

  get bodyClasses(): string {
    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    return paddings[this.padding];
  }
}
