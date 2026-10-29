import type { WeatherData } from '../types/weather';

/** Fixture determinística para desenvolver a interface sem consultar a API. */
export const mockWeatherData: WeatherData = {
  city: {
    id: 2267057,
    name: 'Lisboa',
    admin1: 'Lisboa',
    country: 'Portugal',
    countryCode: 'PT',
    latitude: 38.7167,
    longitude: -9.1333,
  },
  current: {
    temperatureC: 18.2,
    weatherCode: 3,
    observedAt: '2026-10-29T14:00',
    humidityPercent: 68,
    windSpeedKmh: 14.4,
    precipitationMm: 0.2,
    pressureHPa: 1015.2,
  },
  forecast: [
    {
      date: '2026-10-29',
      temperatureMinC: 14,
      temperatureMaxC: 19,
      weatherCode: 3,
      precipitationProbabilityPercent: 10,
    },
    {
      date: '2026-10-30',
      temperatureMinC: 15,
      temperatureMaxC: 20,
      weatherCode: 2,
      precipitationProbabilityPercent: 20,
    },
    {
      date: '2026-10-31',
      temperatureMinC: 13,
      temperatureMaxC: 18,
      weatherCode: 1,
      precipitationProbabilityPercent: 30,
    },
    {
      date: '2026-11-01',
      temperatureMinC: 12,
      temperatureMaxC: 17,
      weatherCode: 3,
      precipitationProbabilityPercent: 40,
    },
    {
      date: '2026-11-02',
      temperatureMinC: 13,
      temperatureMaxC: 19,
      weatherCode: 0,
      precipitationProbabilityPercent: 50,
    },
  ],
  timezone: 'Europe/Lisbon',
  source: 'Open-Meteo',
  fetchedAt: '2026-10-29T14:05:00Z',
};
