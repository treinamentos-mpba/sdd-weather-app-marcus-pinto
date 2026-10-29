import { formatDayLabel, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

const probabilityFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

function formatProbability(probability: number | null | undefined): string {
  if (probability === null || probability === undefined || !Number.isFinite(probability))
    return '—';
  return `${probabilityFormatter.format(probability)}%`;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const dayLabel = formatDayLabel(index, day.date);
  const weather = getWeatherPresentation(day.weatherCode ?? null);

  return (
    <article
      aria-label={`Previsão para ${dayLabel}: ${weather.description}`}
      className="flex min-h-52 flex-col rounded-lg border border-white/10 bg-white/5 p-4 text-white backdrop-blur-md"
    >
      <div>
        <h3 className="text-sm font-semibold text-white">{dayLabel}</h3>
        <p className="mt-0.5 text-xs text-white/75">{getShortDate(day.date)}</p>
      </div>

      <div className="my-4 flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <span aria-hidden="true" className="text-3xl leading-none">
          {weather.icon}
        </span>
        <p className="text-xs text-white/70">{weather.description}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/10 pt-3 text-sm">
        <dt className="text-white/60">Máx.</dt>
        <dd className="text-right font-semibold">
          {formatTemperature(day.temperatureMaxC ?? null, unit)}
        </dd>
        <dt className="text-white/60">Mín.</dt>
        <dd className="text-right font-medium text-white/80">
          {formatTemperature(day.temperatureMinC ?? null, unit)}
        </dd>
        <dt className="text-white/60">Chuva</dt>
        <dd className="text-right font-medium text-white/80">
          {formatProbability(day.precipitationProbabilityPercent)}
        </dd>
      </dl>
    </article>
  );
}
