import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %i °C para %i °F', (temperatureC, expectedFahrenheit) => {
    expect(convertTemperature(temperatureC, 'fahrenheit')).toBe(expectedFahrenheit);
  });

  it('mantém o valor em Celsius quando a unidade selecionada é Celsius', () => {
    expect(convertTemperature(23.5, 'celsius')).toBe(23.5);
  });
});

describe('formatTemperature', () => {
  it.each([
    [20.4, 'celsius', '20 °C'],
    [20.4, 'fahrenheit', '69 °F'],
    [-10.5, 'celsius', '-11 °C'],
    [-0.1, 'celsius', '0 °C'],
  ] as const)('formata %s °C na unidade %s como %s', (temperatureC, unit, expected) => {
    expect(formatTemperature(temperatureC, unit)).toBe(expected);
  });

  it('exibe um travessão quando a temperatura está indisponível', () => {
    expect(formatTemperature(null, 'celsius')).toBe('—');
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo correto para cada unidade', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
