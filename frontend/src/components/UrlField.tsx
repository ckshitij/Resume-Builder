import { ExternalLink } from './ExternalLink';
import { isValidUrl } from '../utils/url';
import { IconLink } from './SocialIcons';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function UrlField({ label, value, onChange, placeholder = 'https://…' }: Props) {
  const valid = isValidUrl(value);

  return (
    <label className="field-with-icon url-field">
      <span className="field-label-row">
        <span className="field-icon"><IconLink size={15} /></span>
        {label}
      </span>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={valid ? 'url-field-valid' : undefined}
      />
      {valid && (
        <span className="url-field-preview">
          Preview: <ExternalLink href={value} className="url-field-link" />
        </span>
      )}
    </label>
  );
}
