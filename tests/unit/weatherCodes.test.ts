import { describe, expect, it } from 'vitest';
import { getWeatherPresentation } from '../../src/lib/weatherCodes';

describe('getWeatherPresentation', () => {
  it('mapeia um código WMO conhecido para descrição e ícone', () => {
    expect(getWeatherPresentation(0)).toEqual({
      description: 'Céu limpo',
      icon: '☀️',
    });
  });

  it.each([999, null])('retorna fallback para código desconhecido (%s)', (code) => {
    expect(getWeatherPresentation(code)).toEqual({
      description: 'Condição indisponível',
      icon: '—',
    });
  });
});
