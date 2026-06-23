import { fromMonthInputValue, toMonthInputValue } from '../utils/dateInput';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  precision?: 'month' | 'year';
}

export function DateField({ label, value, onChange, disabled, precision = 'month' }: Props) {
  if (precision === 'year') {
    return (
      <label>
        {label}
        <input
          type="number"
          className="date-input date-input-year"
          value={value?.slice(0, 4) || ''}
          onChange={(e) => onChange(e.target.value.slice(0, 4))}
          placeholder="YYYY"
          min={1950}
          max={2100}
          disabled={disabled}
        />
      </label>
    );
  }

  return (
    <label>
      {label}
      <input
        type="month"
        className="date-input"
        value={toMonthInputValue(value)}
        onChange={(e) => onChange(fromMonthInputValue(e.target.value))}
        disabled={disabled}
      />
    </label>
  );
}
