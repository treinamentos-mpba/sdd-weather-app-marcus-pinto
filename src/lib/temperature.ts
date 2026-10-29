import type { Unit } from '../types/weather';

const temperatureFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

/** Converte uma temperatura canônica em Celsius para a unidade selecionada. */
export function convertTemperature(temperatureC: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
}

/** Retorna o símbolo da unidade de temperatura. */
export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

/** Formata uma temperatura canônica em Celsius para a unidade selecionada. */
export function formatTemperature(temperatureC: number | null, unit: Unit): string {
  if (temperatureC === null || !Number.isFinite(temperatureC)) return '—';

  const value = convertTemperature(temperatureC, unit);
  const rounded = Math.sign(value) * Math.round(Math.abs(value));
  const normalized = Object.is(rounded, -0) ? 0 : rounded;
  const formatted = temperatureFormatter.format(normalized);

  return `${formatted} ${unitLabel(unit)}`;
}
