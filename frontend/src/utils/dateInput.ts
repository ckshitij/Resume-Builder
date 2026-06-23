export function toMonthInputValue(value: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}$/.test(value)) return value;
  if (/^\d{4}$/.test(value)) return `${value}-01`;
  return '';
}

export function fromMonthInputValue(value: string, yearOnly = false): string {
  if (!value) return '';
  return yearOnly ? value.slice(0, 4) : value.slice(0, 7);
}

export { formatMonthLabel, formatDateRange } from './dateFormat';
