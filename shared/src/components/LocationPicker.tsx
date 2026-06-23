import { useEffect, useMemo, useState } from 'react';
import { Checkbox } from './Checkbox';
import { formatLocation, type LocationParts } from '../utils/locationCore';

type LocationApi = typeof import('../utils/locationApi');

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  fullWidth?: boolean;
  idSuffix?: string;
  allowRemote?: boolean;
}

export function LocationPicker({
  label = 'Location',
  value,
  onChange,
  compact,
  fullWidth,
  idSuffix = 'default',
  allowRemote = false,
}: Props) {
  const [api, setApi] = useState<LocationApi | null>(null);
  const [parts, setParts] = useState<LocationParts | null>(null);
  const [cityQuery, setCityQuery] = useState('');

  useEffect(() => {
    import('../utils/locationApi').then((mod) => {
      setApi(mod);
      const parsed = mod.parseLocation(value);
      setParts(parsed);
      setCityQuery(parsed.city);
    });
  }, []);

  useEffect(() => {
    if (!api) return;
    const parsed = api.parseLocation(value);
    setParts(parsed);
    setCityQuery(parsed.city);
  }, [value, api]);

  const countries = useMemo(() => api?.getCountries() ?? [], [api]);
  const states = useMemo(() => api?.getStates(parts?.countryCode ?? '') ?? [], [api, parts?.countryCode]);
  const cities = useMemo(
    () => api?.getCities(parts?.countryCode ?? '', parts?.stateCode ?? '') ?? [],
    [api, parts?.countryCode, parts?.stateCode],
  );
  const cityOptions = useMemo(
    () => api?.filterCityNames(cities, cityQuery) ?? [],
    [api, cities, cityQuery],
  );

  if (!parts || !api) {
    return <div className="location-picker location-picker-loading"><span className="location-loading-hint">Loading…</span></div>;
  }

  const update = (patch: Partial<LocationParts>) => {
    const next = { ...parts, ...patch };
    if (!allowRemote) next.remote = false;
    setParts(next);
    onChange(formatLocation(next, { includeRemote: allowRemote }));
  };

  const switchMode = (custom: boolean) => {
    if (custom) {
      const next = { ...parts, mode: 'custom' as const, custom: formatLocation(parts, { includeRemote: allowRemote }) || value };
      setParts(next);
      onChange(next.custom);
    } else {
      const parsed = api.parseLocation(parts.custom || value);
      setParts(parsed);
      setCityQuery(parsed.city);
      onChange(formatLocation(parsed, { includeRemote: allowRemote }));
    }
  };

  const cityListId = `city-${idSuffix}-${parts.countryCode}-${parts.stateCode}`;
  const hasStates = states.length > 0;
  const isCustom = parts.mode === 'custom';

  return (
    <div className={`location-picker ${compact ? 'location-picker-compact' : ''} ${fullWidth ? 'location-picker-full' : ''}`}>
      <div className="location-header">
        <span className="location-label">{label}</span>
        <button
          type="button"
          className="location-text-btn"
          onClick={() => switchMode(!isCustom)}
        >
          {isCustom ? 'Use picker' : 'Custom'}
        </button>
      </div>

      {isCustom ? (
        <input
          className="location-control"
          value={parts.custom}
          onChange={(e) => update({ custom: e.target.value, mode: 'custom' })}
          placeholder="e.g. Berlin, Germany"
          aria-label="Custom location"
        />
      ) : (
        <>
          <div className={`location-fields ${hasStates ? 'location-fields-3' : 'location-fields-2'}`}>
            <select
              className="location-control"
              value={parts.countryCode}
              aria-label="Country"
              onChange={(e) => {
                const country = countries.find((c) => c.isoCode === e.target.value);
                update({
                  countryCode: country?.isoCode ?? '',
                  countryName: country?.name ?? '',
                  stateCode: '',
                  stateName: '',
                  city: '',
                });
                setCityQuery('');
              }}
            >
              <option value="">Country</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
              ))}
            </select>

            {hasStates && (
              <select
                className="location-control"
                value={parts.stateCode}
                aria-label="State or region"
                disabled={!parts.countryCode}
                onChange={(e) => {
                  const state = states.find((s) => s.isoCode === e.target.value);
                  update({
                    stateCode: state?.isoCode ?? '',
                    stateName: state?.name ?? '',
                    city: '',
                  });
                  setCityQuery('');
                }}
              >
                <option value="">State / region</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
              </select>
            )}

            <input
              className="location-control"
              list={parts.countryCode ? cityListId : undefined}
              value={cityQuery}
              aria-label="City (optional)"
              placeholder="City (optional)"
              disabled={!parts.countryCode}
              onChange={(e) => {
                setCityQuery(e.target.value);
                update({ city: e.target.value });
              }}
            />
            {parts.countryCode && (
              <datalist id={cityListId}>
                {cityOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            )}
          </div>

          {allowRemote && (
            <Checkbox
              className="location-remote-check"
              label="Remote"
              checked={parts.remote}
              onChange={(remote) => update({ remote })}
            />
          )}
        </>
      )}
    </div>
  );
}
