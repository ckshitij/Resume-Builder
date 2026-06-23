import { Country, State, City } from 'country-state-city';
import { emptyLocationParts, type LocationParts } from './locationCore';

function findCountry(name: string) {
  const n = name.trim().toLowerCase();
  return Country.getAllCountries().find(
    (c) => c.name.toLowerCase() === n || c.isoCode.toLowerCase() === n,
  );
}

function findState(countryCode: string, name: string) {
  const n = name.trim().toLowerCase();
  return State.getStatesOfCountry(countryCode).find(
    (s) => s.name.toLowerCase() === n || s.isoCode.toLowerCase() === n,
  );
}

export function parseLocation(value: string): LocationParts {
  if (!value?.trim()) return emptyLocationParts();

  const trimmed = value.trim();
  if (/^remote$/i.test(trimmed)) {
    return { ...emptyLocationParts(), remote: true };
  }

  if (trimmed.includes(' / ')) {
    return { ...emptyLocationParts(), mode: 'custom', custom: trimmed };
  }

  let remote = false;
  let work = trimmed;
  if (/\(remote\)/i.test(work)) {
    remote = true;
    work = work.replace(/\s*\(remote\)/i, ' ').replace(/\s+/g, ' ').trim();
  }

  const segments = work.split(',').map((p) => p.trim()).filter(Boolean);
  if (!segments.length) return { ...emptyLocationParts(), remote };

  let countryCode = '';
  let countryName = '';
  let stateCode = '';
  let stateName = '';
  let cityParts = [...segments];

  const last = segments[segments.length - 1];
  const country = findCountry(last);
  if (country) {
    countryCode = country.isoCode;
    countryName = country.name;
    cityParts = segments.slice(0, -1);

    if (cityParts.length) {
      const stateCandidate = cityParts[cityParts.length - 1];
      const state = findState(countryCode, stateCandidate);
      if (state) {
        stateCode = state.isoCode;
        stateName = state.name;
        cityParts = cityParts.slice(0, -1);
      }
    }
  } else if (segments.length === 2) {
    const state = findState('US', segments[1]);
    if (state) {
      countryCode = 'US';
      countryName = 'United States';
      stateCode = state.isoCode;
      stateName = state.name;
      cityParts = [segments[0]];
    } else {
      return { ...emptyLocationParts(), mode: 'custom', custom: trimmed };
    }
  } else {
    return { ...emptyLocationParts(), mode: 'custom', custom: trimmed };
  }

  return {
    mode: 'structured',
    remote,
    countryCode,
    countryName,
    stateCode,
    stateName,
    city: cityParts.join(', '),
    custom: '',
  };
}

export function getCountries() {
  return Country.getAllCountries().sort((a, b) => a.name.localeCompare(b.name));
}

export function getStates(countryCode: string) {
  if (!countryCode) return [];
  return State.getStatesOfCountry(countryCode).sort((a, b) => a.name.localeCompare(b.name));
}

export function getCities(countryCode: string, stateCode: string) {
  if (!countryCode) return [];
  if (stateCode) return City.getCitiesOfState(countryCode, stateCode) ?? [];
  return City.getCitiesOfCountry(countryCode) ?? [];
}

export function filterCityNames(cities: { name: string }[], query: string, limit = 120) {
  const q = query.trim().toLowerCase();
  if (!q) return cities.slice(0, limit).map((c) => c.name);
  return cities
    .filter((c) => c.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map((c) => c.name);
}
