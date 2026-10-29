import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="space-y-4">
      <h2 className="text-lg font-semibold text-white" id="forecast-heading">
        Previsão de 5 dias
      </h2>
      {forecast.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.map((day, index) => (
            <li key={day.date}>
              <ForecastCard day={day} index={index} unit={unit} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-white/65">Previsão indisponível.</p>
      )}
    </section>
  );
}
