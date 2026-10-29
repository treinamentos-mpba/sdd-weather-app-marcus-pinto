import { useEffect, useRef, useState } from 'react';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, isDataStale, cities, error, query, search, selectCity, retry } =
    useWeather();
  const mainRef = useRef<HTMLElement>(null);
  const visibleData = data && (status === 'success' || isDataStale) ? data : null;

  useEffect(() => {
    if (
      status === 'success' ||
      status === 'empty' ||
      status === 'error' ||
      status === 'selectingCity'
    ) {
      mainRef.current?.focus();
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center">
          <div className="flex shrink-0 items-center gap-2">
            <span aria-hidden="true" className="text-2xl text-sun">
              ☀️
            </span>
            <h1 className="text-lg font-bold">WeatherView</h1>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar disabled={status === 'loading'} onSearch={search} />
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>
        </div>
      </header>

      <main
        aria-busy={status === 'loading'}
        className="mx-auto max-w-6xl space-y-8 px-4 py-8"
        id="inicio"
        ref={mainRef}
        tabIndex={-1}
      >
        {status === 'idle' && (
          <EmptyState hint="Ex.: Lisboa" title="Busque uma cidade para consultar o clima" />
        )}

        {status === 'loading' && <LoadingState />}

        {status === 'empty' && (
          <EmptyState
            hint="Verifique o nome da cidade e tente novamente."
            title={`Nenhuma cidade encontrada para “${query}”`}
          />
        )}

        {status === 'selectingCity' && <CityResults cities={cities} onSelect={selectCity} />}

        {status === 'error' && (
          <ErrorState message={error ?? 'Algo deu errado. Tente novamente.'} onRetry={retry} />
        )}

        {isDataStale && data && (
          <p aria-live="polite" className="text-sm text-amber-100" role="status">
            Dados anteriores de {data.city.name}; consulta não concluída.
          </p>
        )}

        {visibleData && (
          <div className="space-y-8">
            <CurrentWeather
              city={visibleData.city}
              current={visibleData.current}
              unit={unit}
              timezone={visibleData.timezone}
            />
            <ForecastList forecast={visibleData.forecast} unit={unit} />
            <p className="text-center text-xs text-white/75">Fonte: {visibleData.source}.</p>
          </div>
        )}
      </main>
    </div>
  );
}
