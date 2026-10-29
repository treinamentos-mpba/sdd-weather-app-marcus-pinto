import { expect, type Page, test } from '@playwright/test';

async function mockLisbonWeatherApi(page: Page, onForecastRequest: () => void = () => {}) {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 2267057,
            name: 'Lisboa',
            latitude: 38.7167,
            longitude: -9.1333,
            country_code: 'PT',
            country: 'Portugal',
            admin1: 'Lisboa',
          },
        ],
      }),
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    onForecastRequest();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        latitude: 38.7167,
        longitude: -9.1333,
        timezone: 'Europe/Lisbon',
        utc_offset_seconds: 0,
        current: {
          time: '2026-10-29T14:00',
          temperature_2m: 0,
          relative_humidity_2m: 68,
          wind_speed_10m: 14.4,
          precipitation: 0,
          surface_pressure: 1015.2,
          weather_code: 0,
        },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          weather_code: [0, 1, 2, 3, 45],
          temperature_2m_max: [10, 11, 12, 13, 14],
          temperature_2m_min: [0, 1, 2, 3, 4],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      }),
    });
  });
}

async function searchForLisbon(page: Page) {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();
}

async function expectInvalidSearchNotSent(page: Page, value: string) {
  let geocodingRequested = false;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    geocodingRequested = true;
    await route.abort();
  });

  await page.goto('/');
  const searchbox = page.getByRole('searchbox', { name: 'Cidade' });
  if (value) await searchbox.fill(value);
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toHaveText('Informe o nome da cidade.');
  await expect(searchbox).toHaveAttribute('aria-invalid', 'true');
  expect(geocodingRequested).toBe(false);
}

test('busca cidade, exibe previsão de cinco dias e alterna para Fahrenheit', async ({ page }) => {
  await mockLisbonWeatherApi(page);
  await searchForLisbon(page);

  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(page.getByText('Portugal')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByText('Fonte: Open-Meteo.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Celsius' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(
    page.getByRole('region', { name: 'Lisboa' }).getByText('32 °F', { exact: true }),
  ).toBeVisible();
});

test('mostra estado vazio quando o geocoding omite results', async ({ page }) => {
  let forecastRequested = false;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequested = true;
    await route.abort();
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('CidadeInexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: /Nenhuma cidade encontrada/ })).toBeVisible();
  expect(forecastRequested).toBe(false);
});

test('alternar a unidade cinco vezes preserva dados e não refaz forecast', async ({ page }) => {
  let forecastRequests = 0;
  await mockLisbonWeatherApi(page, () => {
    forecastRequests += 1;
  });
  await searchForLisbon(page);

  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast.getByRole('listitem')).toHaveCount(5);
  const initialForecast = await forecast.getByRole('listitem').allTextContents();
  const currentWeather = page.getByRole('region', { name: 'Lisboa' });

  for (let cycle = 0; cycle < 5; cycle += 1) {
    await page.getByRole('button', { name: 'Fahrenheit' }).click();
    await page.getByRole('button', { name: 'Celsius' }).click();
  }

  await expect(currentWeather.getByText('0 °C', { exact: true })).toBeVisible();
  await expect(forecast.getByRole('listitem')).toHaveText(initialForecast);
  expect(forecastRequests).toBe(1);
});

test('rejeita busca vazia sem chamar o geocoding', async ({ page }) => {
  await expectInvalidSearchNotSent(page, '');
});

test('rejeita busca com apenas espaços sem chamar o geocoding', async ({ page }) => {
  await expectInvalidSearchNotSent(page, '   ');
});

test('preserva acentos e caracteres especiais na busca', async ({ page }) => {
  const query = 'São Paulo & Região';
  let receivedQuery: string | null = null;
  let forecastRequested = false;

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    receivedQuery = new URL(route.request().url()).searchParams.get('name');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequested = true;
    await route.abort();
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill(`  ${query}  `);
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: /Nenhuma cidade encontrada/ })).toBeVisible();
  expect(receivedQuery).toBe(query);
  expect(forecastRequested).toBe(false);
});

test('mostra estado vazio para results explicitamente vazio', async ({ page }) => {
  let forecastRequested = false;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequested = true;
    await route.abort();
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('CidadeInexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: /Nenhuma cidade encontrada/ })).toBeVisible();
  expect(forecastRequested).toBe(false);
});

test('exige seleção de região e consulta as coordenadas da cidade escolhida', async ({ page }) => {
  let forecastCoordinates: string | null = null;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            name: 'Springfield',
            admin1: 'Illinois',
            country: 'United States',
            latitude: 39.78,
            longitude: -89.64,
          },
          {
            name: 'Springfield',
            admin1: 'Massachusetts',
            country: 'United States',
            latitude: 42.1,
            longitude: -72.59,
          },
        ],
      }),
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    const url = new URL(route.request().url());
    forecastCoordinates = `${url.searchParams.get('latitude')},${url.searchParams.get('longitude')}`;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/New_York',
        current: {
          time: '2026-10-29T09:00',
          temperature_2m: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          precipitation: 0,
          surface_pressure: 1015,
          weather_code: 0,
        },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          weather_code: [0, 0, 0, 0, 0],
          temperature_2m_max: [20, 20, 20, 20, 20],
          temperature_2m_min: [10, 10, 10, 10, 10],
          precipitation_probability_max: [0, 0, 0, 0, 0],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Springfield');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Selecione uma cidade' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Selecionar Springfield, Illinois, United States' }),
  ).toBeVisible();
  const massachusetts = page.getByRole('button', {
    name: 'Selecionar Springfield, Massachusetts, United States',
  });
  await expect(massachusetts).toBeVisible();
  expect(forecastCoordinates).toBeNull();

  await massachusetts.click();

  await expect(page.getByRole('heading', { name: 'Springfield' })).toBeVisible();
  await expect(page.getByText('Massachusetts, United States')).toBeVisible();
  await expect(
    page.getByText('Referência temporal: 29/10/2026 às 09:00 (America/New_York)'),
  ).toBeVisible();
  expect(forecastCoordinates).toBe('42.1,-72.59');
});

test('mantém dados anteriores identificados enquanto uma atualização está pendente e falha', async ({
  page,
}) => {
  let forecastRequestCount = 0;
  let signalSecondForecast: () => void = () => {};
  let releaseSecondForecast: () => void = () => {};
  const secondForecastStarted = new Promise<void>((resolve) => {
    signalSecondForecast = resolve;
  });
  const secondForecastGate = new Promise<void>((resolve) => {
    releaseSecondForecast = resolve;
  });

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    const name = new URL(route.request().url()).searchParams.get('name');
    const city =
      name === 'Porto'
        ? { name: 'Porto', latitude: 41.1496, longitude: -8.6109, country: 'Portugal' }
        : { name: 'Lisboa', latitude: 38.7167, longitude: -9.1333, country: 'Portugal' };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [city] }),
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequestCount += 1;
    if (forecastRequestCount > 1) {
      signalSecondForecast();
      await secondForecastGate;
      await route.abort('failed');
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-29T09:00',
          temperature_2m: 20,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          precipitation: 0,
          surface_pressure: 1015,
          weather_code: 0,
        },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          weather_code: [0, 0, 0, 0, 0],
          temperature_2m_max: [20, 20, 20, 20, 20],
          temperature_2m_min: [10, 10, 10, 10, 10],
          precipitation_probability_max: [0, 0, 0, 0, 0],
        },
      }),
    });
  });

  await page.goto('/');
  const searchbox = page.getByRole('searchbox', { name: 'Cidade' });
  await searchbox.fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();

  await searchbox.fill('Porto');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await secondForecastStarted;

  await expect(
    page.getByRole('status').filter({ hasText: 'Carregando previsão do tempo' }),
  ).toBeVisible();
  await expect(page.getByText('Dados anteriores de Lisboa; consulta não concluída.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Lisboa' }).getByText('20 °C')).toBeVisible();
  await expect(
    page.getByText('Referência temporal: 29/10/2026 às 09:00 (America/Sao_Paulo)'),
  ).toBeVisible();

  releaseSecondForecast();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByText('Dados anteriores de Lisboa; consulta não concluída.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Lisboa' })).toBeVisible();
});

test('mostra placeholders quando o forecast não inclui métricas', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            name: 'Lisboa',
            latitude: 38.7167,
            longitude: -9.1333,
            country: 'Portugal',
            admin1: 'Lisboa',
          },
        ],
      }),
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'Europe/Lisbon',
        current: {},
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
        },
      }),
    });
  });

  await searchForLisbon(page);

  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(page.getByText('Condição indisponível')).toHaveCount(6);
  await expect(page.getByText('Referência temporal indisponível')).toBeVisible();
  await expect(page.getByText('—', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/NaN|undefined/)).toHaveCount(0);
});

test('completa o fluxo principal em viewport mobile de 375 por 812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockLisbonWeatherApi(page);
  await searchForLisbon(page);

  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(
    page.getByRole('region', { name: 'Lisboa' }).getByText('32 °F', { exact: true }),
  ).toBeVisible();
});
