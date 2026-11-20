import { BadgeVariant } from './components/ui';

export function roomTypeVariant(type: string): BadgeVariant {
  const t = type.toLowerCase();
  if (t.includes('presidential') || t.includes('family')) return 'warning';
  if (t.includes('suite')) return 'info';
  if (t.includes('deluxe')) return 'success';
  return 'neutral';
}
