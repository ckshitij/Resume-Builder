import type { PersonalInfo } from '../types/resume';
import { displayUrl, ensureUrl } from '../utils/url';
import { IconGitHub, IconLink, IconLinkedIn, IconMail, IconMapPin, IconPhone } from './SocialIcons';

interface Props {
  info: PersonalInfo;
  centered?: boolean;
  compact?: boolean;
  light?: boolean;
  vertical?: boolean;
}

export function ContactLine({ info, centered, compact, light, vertical }: Props) {
  const items: { key: string; icon: React.ReactNode; content: React.ReactNode }[] = [];

  if (info.email) {
    items.push({
      key: 'email',
      icon: <IconMail />,
      content: <a href={`mailto:${info.email}`}>{info.email}</a>,
    });
  }
  if (info.phone) {
    items.push({
      key: 'phone',
      icon: <IconPhone />,
      content: <a href={`tel:${info.phone.replace(/\s/g, '')}`}>{info.phone}</a>,
    });
  }
  if (info.location) {
    items.push({ key: 'location', icon: <IconMapPin />, content: <span>{info.location}</span> });
  }
  if (info.website) {
    items.push({
      key: 'website',
      icon: <IconLink />,
      content: <a href={ensureUrl(info.website)} target="_blank" rel="noopener noreferrer">{displayUrl(info.website)}</a>,
    });
  }
  if (info.linkedIn) {
    items.push({
      key: 'linkedin',
      icon: <IconLinkedIn size={compact ? 13 : 15} />,
      content: (
        <a href={ensureUrl(info.linkedIn)} target="_blank" rel="noopener noreferrer">
          {displayUrl(info.linkedIn)}
        </a>
      ),
    });
  }
  if (info.github) {
    items.push({
      key: 'github',
      icon: <IconGitHub size={compact ? 13 : 15} />,
      content: (
        <a href={ensureUrl(info.github)} target="_blank" rel="noopener noreferrer">
          {displayUrl(info.github)}
        </a>
      ),
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={`contact-row ${centered ? 'centered' : ''} ${compact ? 'compact' : ''} ${light ? 'light' : ''} ${vertical ? 'vertical' : ''}`}>
      {items.map((item) => (
        <span key={item.key} className={`contact-item contact-item-${item.key}`}>
          <span className="contact-icon">{item.icon}</span>
          {item.content}
        </span>
      ))}
    </div>
  );
}
