import { IconLink } from './SocialIcons';
import { displayUrl, ensureUrl } from '../utils/url';

interface Props {
  href: string;
  className?: string;
  showIcon?: boolean;
}

export function ExternalLink({ href, className = '', showIcon = true }: Props) {
  const url = ensureUrl(href);
  if (!url) return null;
  const label = displayUrl(href);

  return (
    <a
      href={url}
      className={`resume-external-link ${className}`.trim()}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
    >
      {showIcon && <IconLink size={12} />}
      <span>{label}</span>
    </a>
  );
}
