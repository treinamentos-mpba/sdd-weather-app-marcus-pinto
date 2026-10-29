import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

export default function CityResults({ cities, onSelect }: CityResultsProps) {
  return (
    <section aria-labelledby="city-results-heading" className="space-y-3">
      <h2 className="text-lg font-semibold" id="city-results-heading">
        Selecione uma cidade
      </h2>
      <ul className="divide-y divide-white/10 rounded-lg border border-white/10 bg-white/5">
        {cities.map((city) => {
          const location = [city.admin1, city.country]
            .filter((part) => part && part !== city.name)
            .join(', ');
          const accessibleName = [city.name, location].filter(Boolean).join(', ');

          return (
            <li key={`${city.latitude},${city.longitude}`}>
              <button
                aria-label={`Selecionar ${accessibleName}`}
                className="flex min-h-14 w-full items-center justify-between gap-4 rounded-md px-4 py-3 text-left transition-colors enabled:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                onClick={() => onSelect(city)}
                type="button"
              >
                <span className="font-medium">{city.name}</span>
                {location && <span className="text-sm text-white/75">{location}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
