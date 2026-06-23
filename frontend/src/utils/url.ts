export function ensureUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

export function displayUrl(url: string): string {
  const href = ensureUrl(url);
  if (!href) return '';
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, '');
    const path = u.pathname.replace(/\/$/, '');
    if (host === 'github.com' && path) {
      return `github.com${path}`;
    }
    if (host === 'linkedin.com' && path) {
      return `linkedin.com${path}`;
    }
    if (path && path !== '/') {
      const short = path.length > 28 ? `${path.slice(0, 26)}…` : path;
      return `${host}${short}`;
    }
    return host;
  } catch {
    return url.replace(/^https?:\/\//, '');
  }
}

export function isValidUrl(url: string): boolean {
  if (!url.trim()) return false;
  try {
    new URL(ensureUrl(url));
    return true;
  } catch {
    return false;
  }
}
