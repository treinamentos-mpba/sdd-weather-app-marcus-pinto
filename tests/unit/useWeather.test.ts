import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/services/weatherService')>();
  return {
    ...actual,
    getWeather: vi.fn(),
    searchCities: vi.fn(),
  };
});

const city = mockWeatherData.city;

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('começa em idle com os dados vazios', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.query).toBe('');
  });

  it('não chama serviços quando a busca contém apenas espaços', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('   ');
    });

    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('expõe loading enquanto o geocoding está pendente', async () => {
    let resolveCities: ((cities: City[]) => void) | undefined;
    vi.mocked(searchCities).mockReturnValue(
      new Promise((resolve) => {
        resolveCities = resolve;
      }),
    );
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());
    let pendingSearch: Promise<void> | undefined;

    act(() => {
      pendingSearch = result.current.search('Lisboa');
    });

    expect(result.current.status).toBe('loading');

    await act(async () => {
      resolveCities?.([city]);
      await pendingSearch;
    });

    expect(result.current.status).toBe('success');
  });

  it('busca uma cidade e carrega o clima da correspondência única', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search(' Lisboa ');
    });

    expect(searchCities).toHaveBeenCalledWith('Lisboa');
    expect(getWeather).toHaveBeenCalledWith(city);
    expect(result.current.query).toBe('Lisboa');
    expect(result.current.cities).toEqual([city]);
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.status).toBe('success');
  });

  it('aguarda seleção explícita para homônimos e consulta a identidade escolhida', async () => {
    const illinois: City = {
      ...city,
      name: 'Springfield',
      admin1: 'Illinois',
      country: 'United States',
      latitude: 39.78,
      longitude: -89.64,
    };
    const massachusetts: City = {
      ...illinois,
      admin1: 'Massachusetts',
      latitude: 42.1,
      longitude: -72.59,
    };
    vi.mocked(searchCities).mockResolvedValue([illinois, massachusetts]);
    vi.mocked(getWeather).mockResolvedValue({ ...mockWeatherData, city: massachusetts });
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Springfield');
    });

    expect(result.current.status).toBe('selectingCity');
    expect(result.current.cities).toEqual([illinois, massachusetts]);
    expect(getWeather).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.selectCity(massachusetts);
    });

    expect(getWeather).toHaveBeenCalledOnce();
    expect(getWeather).toHaveBeenCalledWith(massachusetts);
    expect(result.current.data?.city).toEqual(massachusetts);
    expect(result.current.status).toBe('success');
  });

  it('define empty quando a busca não encontra cidades', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Cidade inexistente');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(result.current.data).toBeNull();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('expõe erro quando o serviço falha', async () => {
    vi.mocked(searchCities).mockRejectedValue(new Error('detalhe interno'));
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Não foi possível concluir a consulta. Tente novamente.');
  });

  it('retry repete a última busca e recupera o sucesso', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error('A requisição demorou demais.'))
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });
    expect(result.current.status).toBe('error');

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledOnce();
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenNthCalledWith(1, city);
    expect(getWeather).toHaveBeenNthCalledWith(2, city);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(mockWeatherData);
  });

  it('informa falha de conexão e retry repete o nome após falha offline no geocoding', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.', 'network'))
      .mockResolvedValueOnce([city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(
      'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
    );

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenNthCalledWith(1, 'Lisboa');
    expect(searchCities).toHaveBeenNthCalledWith(2, 'Lisboa');
    expect(getWeather).toHaveBeenCalledOnce();
    expect(result.current.status).toBe('success');
  });

  it('exibe o limite de tempo ao receber timeout do service', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockRejectedValue(
      new WeatherServiceError('A consulta excedeu o limite de 10 segundos.', 'timeout'),
    );
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('A consulta excedeu o limite de 10 segundos.');
  });

  it('mantém dados identificados como anteriores durante nova consulta e falha', async () => {
    let rejectCities: ((error: Error) => void) | undefined;
    vi.mocked(searchCities)
      .mockResolvedValueOnce([city])
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectCities = reject;
          }),
      );
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    let pendingSearch: Promise<void> | undefined;
    act(() => {
      pendingSearch = result.current.search('Porto');
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.isDataStale).toBe(true);

    await act(async () => {
      rejectCities?.(new WeatherServiceError('Falha de rede.', 'network'));
      await pendingSearch;
    });

    expect(result.current.status).toBe('error');
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.data?.city.name).toBe('Lisboa');
    expect(result.current.isDataStale).toBe(true);
  });

  it('ignora resultados de geocoding obsoletos quando as buscas concluem fora de ordem', async () => {
    const pendingSearches = new Map<string, (cities: City[]) => void>();
    const porto: City = {
      ...city,
      name: 'Porto',
      latitude: 41.1496,
      longitude: -8.6109,
    };
    vi.mocked(searchCities).mockImplementation(
      (name) =>
        new Promise((resolve) => {
          pendingSearches.set(name, resolve);
        }),
    );
    vi.mocked(getWeather).mockImplementation(async (selectedCity) => ({
      ...mockWeatherData,
      city: selectedCity,
    }));
    const { result } = renderHook(() => useWeather());
    let lisbonSearch: Promise<void> | undefined;
    let portoSearch: Promise<void> | undefined;

    act(() => {
      lisbonSearch = result.current.search('Lisboa');
    });
    act(() => {
      portoSearch = result.current.search('Porto');
    });

    await act(async () => {
      pendingSearches.get('Porto')?.([porto]);
      await portoSearch;
    });
    await act(async () => {
      pendingSearches.get('Lisboa')?.([city]);
      await lisbonSearch;
    });

    expect(result.current.query).toBe('Porto');
    expect(result.current.cities).toEqual([porto]);
    expect(result.current.data?.city).toEqual(porto);
    expect(getWeather).toHaveBeenCalledOnce();
    expect(getWeather).toHaveBeenCalledWith(porto);
  });

  it.each([
    'pending',
    'success',
    'error',
  ] as const)('ignora forecast atrasado de Lisboa quando a consulta mais recente está em %s', async (portoOutcome) => {
    const porto: City = {
      ...city,
      name: 'Porto',
      latitude: 41.1496,
      longitude: -8.6109,
    };
    const pendingForecasts = new Map<
      string,
      { resolve: (weather: WeatherData) => void; reject: (reason?: unknown) => void }
    >();
    vi.mocked(searchCities).mockImplementation(async (name) => [name === 'Lisboa' ? city : porto]);
    vi.mocked(getWeather).mockImplementation(
      (selectedCity) =>
        new Promise((resolve, reject) => {
          pendingForecasts.set(selectedCity.name, { resolve, reject });
        }),
    );
    const { result } = renderHook(() => useWeather());
    let lisbonSearch: Promise<void> | undefined;
    let portoSearch: Promise<void> | undefined;

    act(() => {
      lisbonSearch = result.current.search('Lisboa');
    });
    await waitFor(() => expect(getWeather).toHaveBeenCalledTimes(1));

    act(() => {
      portoSearch = result.current.search('Porto');
    });
    await waitFor(() => expect(getWeather).toHaveBeenCalledTimes(2));

    const lisbonForecast = pendingForecasts.get('Lisboa');
    const portoForecast = pendingForecasts.get('Porto');
    if (!lisbonForecast || !portoForecast) throw new Error('Forecast pendente não encontrado.');

    if (portoOutcome === 'success') {
      await act(async () => {
        portoForecast.resolve({ ...mockWeatherData, city: porto });
        await portoSearch;
      });
    } else if (portoOutcome === 'error') {
      await act(async () => {
        portoForecast.reject(new WeatherServiceError('Falha de rede.', 'network'));
        await portoSearch;
      });
    }

    await act(async () => {
      lisbonForecast.resolve(mockWeatherData);
      await lisbonSearch;
    });

    if (portoOutcome === 'pending') {
      expect(result.current.status).toBe('loading');
      expect(result.current.data).toBeNull();
      await act(async () => {
        portoForecast.resolve({ ...mockWeatherData, city: porto });
        await portoSearch;
      });
    } else if (portoOutcome === 'error') {
      expect(result.current.status).toBe('error');
      expect(result.current.data).toBeNull();
    } else {
      expect(result.current.status).toBe('success');
      expect(result.current.data?.city).toEqual(porto);
    }
  });

  it('selectCity carrega a cidade escolhida sem nova busca de geocoding', async () => {
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(city);
    });

    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).toHaveBeenCalledWith(city);
    expect(result.current.status).toBe('success');
  });
});
