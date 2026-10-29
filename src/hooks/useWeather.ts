import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty' | 'selectingCity';

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  isDataStale: boolean;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

type LastOperation = { kind: 'search'; name: string } | { kind: 'city'; city: City };

function errorMessage(error: unknown): string {
  if (!(error instanceof WeatherServiceError)) {
    return 'Não foi possível concluir a consulta. Tente novamente.';
  }

  switch (error.kind) {
    case 'network':
      return 'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.';
    case 'timeout':
      return error.message;
    case 'http':
      return error.status === 429
        ? 'O serviço está recebendo muitas consultas. Aguarde um momento e tente novamente.'
        : 'O serviço de clima está indisponível no momento. Tente novamente em instantes.';
    case 'invalidResponse':
      return 'O serviço retornou dados inválidos. Tente novamente em instantes.';
  }
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [isDataStale, setIsDataStale] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);

  async function loadCityWeather(city: City, operationId: number) {
    setStatus('loading');
    setError(null);
    setIsDataStale(data !== null);

    try {
      const weather = await getWeather(city);
      if (operationId !== requestId.current) return;

      setData(weather);
      setIsDataStale(false);
      setStatus('success');
    } catch (cause) {
      if (operationId !== requestId.current) return;

      setError(errorMessage(cause));
      setIsDataStale(data !== null);
      setStatus('error');
    }
  }

  async function search(name: string): Promise<void> {
    const trimmedName = name.trim();
    const operationId = ++requestId.current;
    setQuery(trimmedName);
    setError(null);
    setIsDataStale(data !== null);
    setCities([]);

    if (!trimmedName) {
      lastOperation.current = null;
      setData(null);
      setIsDataStale(false);
      setStatus('idle');
      return;
    }

    lastOperation.current = { kind: 'search', name: trimmedName };
    setStatus('loading');

    try {
      const results = await searchCities(trimmedName);
      if (operationId !== requestId.current) return;

      setCities(results);
      const firstCity = results[0];
      if (!firstCity) {
        setData(null);
        setIsDataStale(false);
        setStatus('empty');
        return;
      }

      if (results.length > 1) {
        setStatus('selectingCity');
        return;
      }

      lastOperation.current = { kind: 'city', city: firstCity };
      await loadCityWeather(firstCity, operationId);
    } catch (cause) {
      if (operationId !== requestId.current) return;

      setError(errorMessage(cause));
      setIsDataStale(data !== null);
      setStatus('error');
    }
  }

  async function selectCity(city: City): Promise<void> {
    const operationId = ++requestId.current;
    lastOperation.current = { kind: 'city', city };
    setCities((currentCities) =>
      currentCities.some(
        (candidate) =>
          candidate.latitude === city.latitude && candidate.longitude === city.longitude,
      )
        ? currentCities
        : [city],
    );

    await loadCityWeather(city, operationId);
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (!operation) {
      setStatus('idle');
      return;
    }

    if (operation.kind === 'search') {
      await search(operation.name);
      return;
    }

    await selectCity(operation.city);
  }

  return { status, data, isDataStale, cities, error, query, search, selectCity, retry };
}
