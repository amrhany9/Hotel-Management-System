import { ValueTransformer } from 'typeorm';

export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | number | null) => (value === null || value === undefined ? value : Number(value)),
};

export const dateOnlyTransformer: ValueTransformer = {
  to: (value: string | null | undefined) => value,
  from: (value: Date | string | null) => {
    if (value === null || value === undefined) return value;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
  },
};
