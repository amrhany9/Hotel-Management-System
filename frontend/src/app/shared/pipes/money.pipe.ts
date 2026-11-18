import { Pipe, PipeTransform, inject } from '@angular/core';
import { SettingsService } from '../../core/services/settings.service';

const formatters = new Map<string, Intl.NumberFormat>();

@Pipe({
  name: 'money',
  standalone: true,
  pure: false,
})
export class MoneyPipe implements PipeTransform {
  private settings = inject(SettingsService);

  transform(value: number | null | undefined, decimals = 2): string {
    const currency = this.settings.settings().currency || 'USD';
    const key = `${currency}:${decimals}`;
    let formatter = formatters.get(key);
    if (!formatter) {
      formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      formatters.set(key, formatter);
    }
    return formatter.format(value ?? 0);
  }
}
