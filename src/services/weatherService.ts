import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

export type WeatherServiceErrorKind = 'network' | 'timeout' | 'http' | 'invalidResponse';

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    readonly kind: WeatherServiceErrorKind,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

const geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
const forecastUrl = 'https://api.open-meteo.com/v1/forecast';

const currentFields =
  'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure,weather_code';
const dailyFields =
  'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max';
const requestTimeoutMs = 10_000;

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
      throw new WeatherServiceError(
        `A consulta excedeu o limite de ${requestTimeoutMs / 1000} segundos.`,
        'timeout',
      );
    }

    throw new WeatherServiceError('Falha de rede.', 'network');
  } finally {
    clearTimeout(timeoutId);
  }
}

interface GeocodingResult {
  id?: number;
  name: string;
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapCity(value: unknown): City {
  if (!isRecord(value)) {
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.', 'invalidResponse');
  }

  const { id, name, admin1, country, country_code: countryCode, latitude, longitude } = value;

  if (
    typeof name !== 'string' ||
    name.trim() === '' ||
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.', 'invalidResponse');
  }

  return {
    ...(typeof id === 'number' && Number.isInteger(id) ? { id } : {}),
    name,
    ...(typeof admin1 === 'string' ? { admin1 } : {}),
    ...(typeof country === 'string' ? { country } : {}),
    ...(typeof countryCode === 'string' ? { countryCode } : {}),
    latitude,
    longitude,
  };
}

function invalidForecastResponse(): never {
  throw new WeatherServiceError('Resposta incompleta ou inválida da previsão.', 'invalidResponse');
}

function readNullableNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) return invalidForecastResponse();
  return value;
}

function readNullableString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return invalidForecastResponse();
  return value.trim() === '' ? null : value;
}

function readNullableNumberSeries(
  record: Record<string, unknown>,
  key: string,
  length: number,
): unknown[] {
  const value = record[key];
  if (value === null || value === undefined) return Array<null>(length).fill(null);
  if (!Array.isArray(value) || value.length > length) return invalidForecastResponse();
  return Array.from({ length }, (_, index) => value[index] ?? null);
}

function mapForecastDays(daily: Record<string, unknown> | null): ForecastDay[] {
  if (!daily) return [];

  const dates = daily.time;
  if (dates === null || dates === undefined) return [];

  if (!Array.isArray(dates) || dates.length !== 5) {
    return invalidForecastResponse();
  }

  const weatherCodes = readNullableNumberSeries(daily, 'weather_code', dates.length);
  const temperatureMax = readNullableNumberSeries(daily, 'temperature_2m_max', dates.length);
  const temperatureMin = readNullableNumberSeries(daily, 'temperature_2m_min', dates.length);
  const precipitationProbability = readNullableNumberSeries(
    daily,
    'precipitation_probability_max',
    dates.length,
  );

  const dateValues: unknown[] = dates;
  const weatherCodeValues: unknown[] = weatherCodes;
  const temperatureMaxValues: unknown[] = temperatureMax;
  const temperatureMinValues: unknown[] = temperatureMin;
  const precipitationProbabilityValues: unknown[] = precipitationProbability;

  const actualDates = dateValues.filter((date): date is string => {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
  });

  if (
    actualDates.length !== dateValues.length ||
    new Set(actualDates).size !== actualDates.length
  ) {
    return invalidForecastResponse();
  }

  const firstDate = new Date(`${actualDates[0]}T00:00:00.000Z`);
  const expectedDates = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(firstDate);
    date.setUTCDate(firstDate.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });

  return expectedDates.map((date) => {
    const sourceIndex = actualDates.indexOf(date);
    const weatherCode = sourceIndex === -1 ? null : weatherCodeValues[sourceIndex];
    const max = sourceIndex === -1 ? null : temperatureMaxValues[sourceIndex];
    const min = sourceIndex === -1 ? null : temperatureMinValues[sourceIndex];
    const probability = sourceIndex === -1 ? null : precipitationProbabilityValues[sourceIndex];

    return {
      date,
      weatherCode: readNullableNumber({ value: weatherCode }, 'value'),
      temperatureMaxC: readNullableNumber({ value: max }, 'value'),
      temperatureMinC: readNullableNumber({ value: min }, 'value'),
      precipitationProbabilityPercent: readNullableNumber({ value: probability }, 'value'),
    };
  });
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();
  if (!trimmedName) return [];

  const url = `${geocodingUrl}?name=${encodeURIComponent(trimmedName)}&count=10&language=pt&format=json`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Open-Meteo retornou HTTP ${response.status} ao buscar cidades.`,
      'http',
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.', 'invalidResponse');
  }

  if (!isRecord(payload)) {
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.', 'invalidResponse');
  }

  const results = (payload as GeocodingResponse).results;
  if (results === undefined || results === null) return [];
  if (!Array.isArray(results)) {
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.', 'invalidResponse');
  }

  return results.map(mapCity);
}

export async function getWeather(city: City): Promise<WeatherData> {
  const query = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: currentFields,
    daily: dailyFields,
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });

  const response = await fetchWithTimeout(`${forecastUrl}?${query.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Open-Meteo retornou HTTP ${response.status} ao buscar a previsão.`,
      'http',
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    return invalidForecastResponse();
  }

  if (!isRecord(payload)) {
    return invalidForecastResponse();
  }

  const currentPayload = payload.current;
  const dailyPayload = payload.daily;
  if (
    (currentPayload !== null && currentPayload !== undefined && !isRecord(currentPayload)) ||
    (dailyPayload !== null && dailyPayload !== undefined && !isRecord(dailyPayload))
  ) {
    return invalidForecastResponse();
  }

  const currentRecord = isRecord(currentPayload) ? currentPayload : null;
  const dailyRecord = isRecord(dailyPayload) ? dailyPayload : null;
  const timezone = readNullableString(payload, 'timezone');
  const current: CurrentWeather | null = currentRecord
    ? {
        temperatureC: readNullableNumber(currentRecord, 'temperature_2m'),
        humidityPercent: readNullableNumber(currentRecord, 'relative_humidity_2m'),
        windSpeedKmh: readNullableNumber(currentRecord, 'wind_speed_10m'),
        precipitationMm: readNullableNumber(currentRecord, 'precipitation'),
        pressureHPa: readNullableNumber(currentRecord, 'surface_pressure'),
        weatherCode: readNullableNumber(currentRecord, 'weather_code'),
        observedAt: readNullableString(currentRecord, 'time'),
      }
    : null;

  return {
    city,
    current,
    forecast: mapForecastDays(dailyRecord),
    timezone,
    source: 'Open-Meteo',
    fetchedAt: new Date().toISOString(),
  };
}
