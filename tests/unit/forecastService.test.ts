import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  name: 'Lisboa',
  country: 'Portugal',
  latitude: 38.7167,
  longitude: -9.1333,
};

const daily = {
  time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
  weather_code: [3, 2, 1, 3, 0],
  temperature_2m_max: [19, 20, 18, 17, 19],
  temperature_2m_min: [14, 15, 13, 12, 13],
  precipitation_probability_max: [10, 20, 30, 40, 50],
};

function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function makeForecastResponse(overrides: Record<string, unknown> = {}) {
  return {
    timezone: 'Europe/Lisbon',
    current: {
      time: '2026-10-29T14:00',
      temperature_2m: 18.2,
      relative_humidity_2m: 68,
      wind_speed_10m: 14.4,
      precipitation: 0.2,
      surface_pressure: 1015.2,
      weather_code: 3,
    },
    daily,
    ...overrides,
  };
}

describe('getWeather', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('solicita current e daily e mapeia cinco dias para WeatherData', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(makeResponse(makeForecastResponse()));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);
    const requestUrl = new URL(fetchMock.mock.calls[0]?.[0] as string);

    expect(requestUrl.origin + requestUrl.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(requestUrl.searchParams.get('latitude')).toBe(String(city.latitude));
    expect(requestUrl.searchParams.get('longitude')).toBe(String(city.longitude));
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestUrl.searchParams.get('temperature_unit')).toBe('celsius');
    expect(requestUrl.searchParams.get('current')).toContain('temperature_2m');
    expect(requestUrl.searchParams.get('daily')).toContain('precipitation_probability_max');
    expect(result.city).toEqual(city);
    expect(result.timezone).toBe('Europe/Lisbon');
    expect(result.current).toEqual({
      temperatureC: 18.2,
      humidityPercent: 68,
      windSpeedKmh: 14.4,
      precipitationMm: 0.2,
      pressureHPa: 1015.2,
      weatherCode: 3,
      observedAt: '2026-10-29T14:00',
    });
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]).toEqual({
      date: '2026-10-29',
      weatherCode: 3,
      temperatureMaxC: 19,
      temperatureMinC: 14,
      precipitationProbabilityPercent: 10,
    });
    expect(result.forecast[4]?.date).toBe('2026-11-02');
    expect(result.source).toBe('Open-Meteo');
    expect(Number.isNaN(Date.parse(result.fetchedAt))).toBe(false);
  });

  it('preserva as datas locais retornadas no timezone da cidade', async () => {
    const localDates = ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'];
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      makeResponse(
        makeForecastResponse({
          timezone: 'America/Sao_Paulo',
          daily: { ...daily, time: localDates },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.timezone).toBe('America/Sao_Paulo');
    expect(result.forecast.map((day) => day.date)).toEqual(localDates);
  });

  it('preserva precipitação nula como indisponível', async () => {
    const current = {
      time: '2026-10-29T14:00',
      temperature_2m: 18.2,
      relative_humidity_2m: 68,
      wind_speed_10m: 14.4,
      precipitation: null,
      surface_pressure: 1015.2,
      weather_code: 3,
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(makeResponse(makeForecastResponse({ current })));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.current?.precipitationMm).toBeNull();
  });

  it('preserva métricas opcionais ausentes e valores diários nulos', async () => {
    const current = {
      time: '2026-10-29T14:00',
      temperature_2m: 18.2,
      relative_humidity_2m: null,
      precipitation: null,
      surface_pressure: 1015.2,
      weather_code: 3,
    };
    const partialDaily = {
      ...daily,
      temperature_2m_min: [null, 15, 13, 12, 13],
      precipitation_probability_max: [null, 20, 30, 40, 50],
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(makeResponse(makeForecastResponse({ current, daily: partialDaily })));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.current?.humidityPercent).toBeNull();
    expect(result.current?.windSpeedKmh).toBeNull();
    expect(result.current?.precipitationMm).toBeNull();
    expect(result.forecast[0]?.temperatureMinC).toBeNull();
    expect(result.forecast[0]?.precipitationProbabilityPercent).toBeNull();
  });

  it('preserva clima atual como indisponível quando current está ausente', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(makeResponse(makeForecastResponse({ current: undefined })));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.current).toBeNull();
    expect(result.forecast).toHaveLength(5);
  });

  it('retorna previsão vazia quando daily está ausente', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(makeResponse(makeForecastResponse({ daily: undefined })));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.current?.temperatureC).toBe(18.2);
    expect(result.forecast).toEqual([]);
  });

  it('preenche com null as séries diárias inteiras ausentes', async () => {
    const partialDaily = { time: daily.time };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        makeResponse(makeForecastResponse({ daily: partialDaily, timezone: null })),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.timezone).toBeNull();
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast).toEqual(
      daily.time.map((date) => ({
        date,
        weatherCode: null,
        temperatureMaxC: null,
        temperatureMinC: null,
        precipitationProbabilityPercent: null,
      })),
    );
  });

  it('mantém a janela de cinco datas quando falta um dia e vem uma data extra', async () => {
    const partialDaily = {
      ...daily,
      time: ['2026-10-29', '2026-10-30', '2026-11-01', '2026-11-02', '2026-11-03'],
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(makeResponse(makeForecastResponse({ daily: partialDaily })));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.forecast).toEqual([
      {
        date: '2026-10-29',
        weatherCode: 3,
        temperatureMaxC: 19,
        temperatureMinC: 14,
        precipitationProbabilityPercent: 10,
      },
      {
        date: '2026-10-30',
        weatherCode: 2,
        temperatureMaxC: 20,
        temperatureMinC: 15,
        precipitationProbabilityPercent: 20,
      },
      {
        date: '2026-10-31',
        weatherCode: null,
        temperatureMaxC: null,
        temperatureMinC: null,
        precipitationProbabilityPercent: null,
      },
      {
        date: '2026-11-01',
        weatherCode: 1,
        temperatureMaxC: 18,
        temperatureMinC: 13,
        precipitationProbabilityPercent: 30,
      },
      {
        date: '2026-11-02',
        weatherCode: 3,
        temperatureMaxC: 17,
        temperatureMinC: 12,
        precipitationProbabilityPercent: 40,
      },
    ]);
  });

  it('normaliza todos os campos atuais ausentes como null', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(makeResponse(makeForecastResponse({ current: {} })));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.current).toEqual({
      temperatureC: null,
      humidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      pressureHPa: null,
      weatherCode: null,
      observedAt: null,
    });
  });

  it('lança WeatherServiceError quando os arrays daily não contêm cinco itens paralelos', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        makeResponse(makeForecastResponse({ daily: { ...daily, time: daily.time.slice(0, 4) } })),
      );
    vi.stubGlobal('fetch', fetchMock);
    const request = getWeather(city);

    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({ kind: 'invalidResponse' });
  });

  it('lança WeatherServiceError para resposta HTTP não-ok', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(makeResponse({}, 503));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'http',
      status: 503,
    });
  });

  it('classifica rate limit HTTP 429 como erro do service', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(makeResponse({}, 429));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'http',
      status: 429,
    });
  });

  it('converte falha de rede do forecast em WeatherServiceError', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: 'Falha de rede.',
    });
  });

  it('converte JSON inválido em WeatherServiceError', async () => {
    const response = {
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('invalid JSON');
      },
    } as unknown as Response;
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalidResponse',
    });
  });
});
