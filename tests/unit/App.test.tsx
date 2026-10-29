import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { type UseWeatherResult, useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weatherData';

vi.mock('../../src/hooks/useWeather', () => ({
  useWeather: vi.fn(),
}));

const useWeatherMock = vi.mocked(useWeather);

function makeWeatherState(overrides: Partial<UseWeatherResult> = {}): UseWeatherResult {
  return {
    status: 'idle',
    data: null,
    isDataStale: false,
    cities: [],
    error: null,
    query: '',
    search: vi.fn(),
    selectCity: vi.fn(),
    retry: vi.fn(),
    ...overrides,
  };
}

describe('App', () => {
  beforeEach(() => {
    useWeatherMock.mockReset();
  });

  it('renderiza a busca e a orientação inicial em idle', () => {
    useWeatherMock.mockReturnValue(makeWeatherState());

    render(<App />);

    expect(screen.getByRole('search', { name: 'Buscar uma cidade' })).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Busque uma cidade para consultar o clima' }),
    ).toBeVisible();
  });

  it('renderiza o indicador de loading', () => {
    useWeatherMock.mockReturnValue(makeWeatherState({ status: 'loading' }));

    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando previsão do tempo...');
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });

  it('move o foco para o conteúdo quando a consulta termina', () => {
    let weatherState = makeWeatherState({ status: 'loading' });
    useWeatherMock.mockImplementation(() => weatherState);
    const { rerender } = render(<App />);

    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');

    weatherState = makeWeatherState({ status: 'success', data: mockWeatherData });
    rerender(<App />);

    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('mantém e identifica dados anteriores durante uma nova consulta', () => {
    useWeatherMock.mockReturnValue(
      makeWeatherState({ status: 'loading', data: mockWeatherData, isDataStale: true }),
    );

    render(<App />);

    expect(screen.getByText('Dados anteriores de Lisboa; consulta não concluída.')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
    expect(
      screen.getByText('Referência temporal: 29/10/2026 às 14:00 (Europe/Lisbon)'),
    ).toBeVisible();
  });

  it('encaminha a busca do formulário para o hook', async () => {
    const user = userEvent.setup();
    const search = vi.fn();
    useWeatherMock.mockReturnValue(makeWeatherState({ search }));

    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(search).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledWith('Lisboa');
  });

  it('renderiza o estado empty com título e dica', () => {
    useWeatherMock.mockReturnValue(makeWeatherState({ status: 'empty', query: 'Atlantis' }));

    render(<App />);

    expect(screen.getByRole('heading', { name: /nenhuma cidade encontrada/i })).toBeVisible();
    expect(screen.getByText('Verifique o nome da cidade e tente novamente.')).toBeVisible();
  });

  it('apresenta homônimos com região e país para seleção explícita', async () => {
    const user = userEvent.setup();
    const selectCity = vi.fn();
    const cities = [
      {
        ...mockWeatherData.city,
        name: 'Springfield',
        admin1: 'Illinois',
        country: 'United States',
      },
      {
        ...mockWeatherData.city,
        name: 'Springfield',
        admin1: 'Massachusetts',
        country: 'United States',
        latitude: 42.1,
      },
    ];
    useWeatherMock.mockReturnValue(
      makeWeatherState({ status: 'selectingCity', cities, selectCity }),
    );

    render(<App />);

    expect(
      screen.getByRole('button', { name: 'Selecionar Springfield, Illinois, United States' }),
    ).toBeVisible();
    const secondCity = screen.getByRole('button', {
      name: 'Selecionar Springfield, Massachusetts, United States',
    });
    await user.click(secondCity);

    expect(selectCity).toHaveBeenCalledWith(cities[1]);
  });

  it('renderiza o erro e encaminha retry', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    useWeatherMock.mockReturnValue(
      makeWeatherState({ status: 'error', error: 'Falha de rede.', retry }),
    );

    render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha de rede.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('renderiza o mock e deriva a temperatura quando a unidade muda', async () => {
    const user = userEvent.setup();
    useWeatherMock.mockReturnValue(makeWeatherState({ status: 'success', data: mockWeatherData }));

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
    expect(
      screen.getByText('Referência temporal: 29/10/2026 às 14:00 (Europe/Lisbon)'),
    ).toBeVisible();
    expect(screen.getAllByText('18 °C')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('65 °F')).toBeVisible();
  });

  it('exibe fallbacks para clima atual e previsão com campos ausentes', () => {
    useWeatherMock.mockReturnValue(
      makeWeatherState({
        status: 'success',
        data: {
          ...mockWeatherData,
          current: null,
          forecast: [
            {
              date: '2026-10-29',
              temperatureMinC: null,
              temperatureMaxC: null,
              weatherCode: null,
              precipitationProbabilityPercent: null,
            },
          ],
        },
      }),
    );

    render(<App />);

    expect(screen.getAllByText('Condição indisponível')).toHaveLength(2);
    expect(screen.getByText('Precipitação')).toBeVisible();
    expect(screen.getAllByText('—').length).toBeGreaterThan(1);
    expect(screen.queryByText(/undefined|NaN/)).not.toBeInTheDocument();
  });
});
