import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';

function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('searchCities', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('retorna lista vazia sem chamar a rede quando o nome está vazio', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica o nome e mapeia resultados para City', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      makeResponse({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.5475,
            longitude: -46.6361,
            country_code: 'BR',
            country: 'Brasil',
            admin1: 'São Paulo',
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const cities = await searchCities(' São Paulo & Região ');
    const requestUrl = fetchMock.mock.calls[0][0] as string;

    expect(requestUrl).toContain(`name=${encodeURIComponent('São Paulo & Região')}`);
    expect(cities).toEqual([
      {
        id: 3448439,
        name: 'São Paulo',
        latitude: -23.5475,
        longitude: -46.6361,
        countryCode: 'BR',
        country: 'Brasil',
        admin1: 'São Paulo',
      },
    ]);
  });

  it('preserva cidades homônimas como resultados distintos', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      makeResponse({
        results: [
          {
            name: 'Springfield',
            latitude: 39.78,
            longitude: -89.64,
            country: 'United States',
            admin1: 'Illinois',
          },
          {
            name: 'Springfield',
            latitude: 42.1,
            longitude: -72.59,
            country: 'United States',
            admin1: 'Massachusetts',
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const results = await searchCities('Springfield');

    expect(results).toHaveLength(2);
    expect(results.map((result) => result.admin1)).toEqual(['Illinois', 'Massachusetts']);
    expect(results[0]?.latitude).not.toBe(results[1]?.latitude);
  });

  it('retorna lista vazia quando o provedor não encontra resultados', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(makeResponse({ results: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('CidadeInexistente')).resolves.toEqual([]);
  });

  it('retorna lista vazia quando a resposta não contém results', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(makeResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('CidadeInexistente')).resolves.toEqual([]);
  });

  it('lança WeatherServiceError para uma resposta HTTP não-ok', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(makeResponse({}, 503));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'http',
      status: 503,
    });
  });

  it('lança WeatherServiceError para falha de rede', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    const request = searchCities('Lisboa');

    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({
      kind: 'network',
      message: 'Falha de rede.',
    });
  });

  it('lança WeatherServiceError para resultados inválidos', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(makeResponse({ results: [{ name: 'Sem coordenadas' }] }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalidResponse',
    });
  });

  it('converte AbortError em timeout após 10 segundos e limpa o timer', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = fetchWithTimeout('https://example.test');
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: 'A consulta excedeu o limite de 10 segundos.',
    });

    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('limpa o timer quando a requisição termina com sucesso', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(makeResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchWithTimeout('https://example.test')).resolves.toMatchObject({ ok: true });
    expect(vi.getTimerCount()).toBe(0);
  });
});
