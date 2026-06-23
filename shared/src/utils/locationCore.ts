export interface LocationParts {
  mode: 'structured' | 'custom';
  remote: boolean;
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  city: string;
  custom: string;
}

export const emptyLocationParts = (): LocationParts => ({
  mode: 'structured',
  remote: false,
  countryCode: '',
  countryName: '',
  stateCode: '',
  stateName: '',
  city: '',
  custom: '',
});

export function formatLocation(parts: LocationParts, options?: { includeRemote?: boolean }): string {
  if (parts.mode === 'custom') return parts.custom.trim();

  const includeRemote = options?.includeRemote ?? true;
  const city = parts.city.trim();
  if (includeRemote && parts.remote && !city && !parts.countryName) return 'Remote';

  const segments: string[] = [];
  if (city) segments.push(city);
  if (parts.stateName && parts.stateName.toLowerCase() !== city.toLowerCase()) {
    segments.push(parts.stateName);
  }
  if (parts.countryName) segments.push(parts.countryName);

  let result = segments.join(', ');
  if (includeRemote && parts.remote) {
    result = result ? `${result} (Remote)` : 'Remote';
  }
  return result;
}
