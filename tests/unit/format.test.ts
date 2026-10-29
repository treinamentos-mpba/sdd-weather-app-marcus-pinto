import { describe, expect, it } from 'vitest';
import { formatDayLabel, formatWeatherReference, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it('rotula o primeiro dia como Hoje', () => {
    expect(formatDayLabel(0, '2026-10-29')).toBe('Hoje');
  });

  it('rotula o segundo dia como Amanhã', () => {
    expect(formatDayLabel(1, '2026-10-30')).toBe('Amanhã');
  });

  it('usa o dia da semana a partir do terceiro item', () => {
    expect(formatDayLabel(2, '2026-10-31')).toBe('Sábado');
  });

  it('retorna fallback para uma data inválida', () => {
    expect(formatDayLabel(0, '2026-02-30')).toBe('Data indisponível');
  });
});

describe('getShortDate', () => {
  it('formata a data no padrão DD/MM', () => {
    expect(getShortDate('2026-10-29')).toBe('29/10');
  });

  it('retorna fallback para uma data inválida', () => {
    expect(getShortDate('data inválida')).toBe('—');
  });
});

describe('formatWeatherReference', () => {
  it('preserva data e hora local e informa o fuso fornecido', () => {
    expect(formatWeatherReference('2026-10-29T09:00', 'America/Sao_Paulo')).toBe(
      'Referência temporal: 29/10/2026 às 09:00 (America/Sao_Paulo)',
    );
  });

  it('informa indisponibilidade sem inventar horário', () => {
    expect(formatWeatherReference(null, 'America/Sao_Paulo')).toBe(
      'Referência temporal indisponível',
    );
  });

  it('identifica o fuso como indisponível quando só o timezone falta', () => {
    expect(formatWeatherReference('2026-10-29T09:00', null)).toBe(
      'Referência temporal: 29/10/2026 às 09:00 (fuso indisponível)',
    );
  });
});
