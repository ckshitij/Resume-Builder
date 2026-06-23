interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ label, checked, onChange, className }: Props) {
  return (
    <label className={`ui-checkbox ${className ?? ''}`.trim()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="ui-checkbox-box" aria-hidden="true" />
      <span className="ui-checkbox-label">{label}</span>
    </label>
  );
}
