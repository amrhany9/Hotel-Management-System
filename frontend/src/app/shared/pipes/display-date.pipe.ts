import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

export type DisplayDateFormat = 'date' | 'datetime' | 'time' | 'month';

const OPTIONS: Record<DisplayDateFormat, Intl.DateTimeFormatOptions> = {
  date: { day: 'numeric', month: 'short', year: 'numeric' },
  datetime: { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' },
  time: { hour: 'numeric', minute: '2-digit' },
  month: { month: 'long', year: 'numeric' },
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function parse(value: string | Date): Date {
  if (value instanceof Date) return value;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return dateOnly ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])) : new Date(value);
}

@Pipe({
  name: 'appDate',
  standalone: true,
  pure: false,
})
export class DisplayDatePipe implements PipeTransform {
  private translation = inject(TranslationService);

  transform(value: string | Date | null | undefined, format: DisplayDateFormat = 'date'): string {
    if (!value) return '—';
    const locale = this.translation.currentLang() === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
    const key = `${locale}:${format}`;
    let formatter = formatters.get(key);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(locale, OPTIONS[format]);
      formatters.set(key, formatter);
    }
    const date = parse(value);
    return Number.isNaN(date.getTime()) ? '—' : formatter.format(date);
  }
}
