import { useId } from 'react';
import { formatWeatherReference } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

const metricFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData | null;
  unit: Unit;
  timezone: string | null;
}

interface MetricProps {
  label: string;
  value: number | null | undefined;
  unit: string;
}

function Metric({ label, value, unit }: MetricProps) {
  const formattedValue =
    value === null || value === undefined || !Number.isFinite(value)
      ? '—'
      : `${metricFormatter.format(value)} ${unit}`;

  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-white/5 px-3 py-3">
      <dt className="text-xs font-medium text-white/65">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-white">{formattedValue}</dd>
    </div>
  );
}

export default function CurrentWeather({ city, current, unit, timezone }: CurrentWeatherProps) {
  const titleId = useId();
  const weather = getWeatherPresentation(current?.weatherCode ?? null);
  const location = [city.admin1, city.country]
    .filter((part) => part && part !== city.name)
    .join(', ');

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-lg backdrop-blur-md sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold" id={titleId}>
            {city.name}
          </h2>
          {location && <p className="mt-1 text-sm text-white/65">{location}</p>}
        </div>
        <div aria-label="Condição atual" className="flex items-center gap-3" role="group">
          <span aria-hidden="true" className="text-4xl leading-none">
            {weather.icon}
          </span>
          <p className="max-w-40 text-right text-sm text-white/80">{weather.description}</p>
        </div>
      </div>

      <p className="mt-6 text-5xl font-bold leading-none text-white sm:text-7xl">
        {formatTemperature(current?.temperatureC ?? null, unit)}
      </p>
      <p className="mt-2 text-sm text-white/60">Clima atual</p>
      <p className="mt-1 text-sm text-white/75">
        {formatWeatherReference(current?.observedAt ?? null, timezone)}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Umidade" value={current?.humidityPercent} unit="%" />
        <Metric label="Vento" value={current?.windSpeedKmh} unit="km/h" />
        <Metric label="Precipitação" value={current?.precipitationMm} unit="mm" />
        <Metric label="Pressão" value={current?.pressureHPa} unit="hPa" />
      </dl>
    </section>
  );
}
