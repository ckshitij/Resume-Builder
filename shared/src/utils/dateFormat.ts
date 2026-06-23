export function formatMonthLabel(value: string): string {
  if (!value?.trim()) return '';
  const trimmed = value.trim();
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{4})-(\d{2})/);
  if (!match) return trimmed;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  if (Number.isNaN(date.getTime())) return trimmed;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatDateRange(start: string, end: string, current: boolean): string {
  const startLabel = formatMonthLabel(start);
  if (current) return startLabel ? `${startLabel} — Present` : 'Present';
  const endLabel = formatMonthLabel(end);
  if (startLabel && endLabel) return `${startLabel} — ${endLabel}`;
  return startLabel || endLabel;
}
