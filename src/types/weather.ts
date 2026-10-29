/** Unidade usada para exibir temperaturas; os dados meteorológicos ficam em Celsius. */
export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  /** Identificador Geonames, quando fornecido pelo geocoding. */
  id?: number;
  /** Nome da cidade retornado pelo provedor. */
  name: string;
  /** Região administrativa, quando disponível. */
  admin1?: string;
  /** País, quando disponível. */
  country?: string;
  /** Código do país, quando disponível. */
  countryCode?: string;
  /** Latitude usada para consultar a previsão. */
  latitude: number;
  /** Longitude usada para consultar a previsão. */
  longitude: number;
}

export interface CurrentWeather {
  /** Temperatura atual normalizada para Celsius; null quando indisponível. */
  temperatureC: number | null;
  /** Código WMO da condição atual; null quando indisponível ou desconhecido. */
  weatherCode: number | null;
  /** Horário de referência fornecido em current.time, sem o horário da consulta. */
  observedAt: string | null;
  /** Umidade relativa do ar em porcentagem; null quando indisponível. */
  humidityPercent: number | null;
  /** Velocidade do vento em quilômetros por hora; null quando indisponível. */
  windSpeedKmh: number | null;
  /** Precipitação atual em milímetros; null quando indisponível. */
  precipitationMm: number | null;
  /** Pressão de superfície em hectopascais; null quando indisponível. */
  pressureHPa: number | null;
}

export interface ForecastDay {
  /** Data local da previsão, no formato YYYY-MM-DD. */
  date: string;
  /** Temperatura mínima em Celsius; null quando indisponível. */
  temperatureMinC: number | null;
  /** Temperatura máxima em Celsius; null quando indisponível. */
  temperatureMaxC: number | null;
  /** Código WMO da condição prevista; null quando indisponível ou desconhecido. */
  weatherCode: number | null;
  /** Probabilidade máxima diária de precipitação em porcentagem; null quando indisponível. */
  precipitationProbabilityPercent: number | null;
}

export interface WeatherData {
  /** Cidade selecionada para a consulta. */
  city: City;
  /** Condições atuais; null se o provedor não as retornar. */
  current: CurrentWeather | null;
  /** Dias disponíveis da janela de cinco dias, em ordem cronológica. */
  forecast: ForecastDay[];
  /** Fuso IANA retornado pela Open-Meteo; null quando indisponível. */
  timezone: string | null;
  /** Fonte dos dados meteorológicos. */
  source: 'Open-Meteo';
  /** Instante da consulta em formato ISO, distinto de observedAt. */
  fetchedAt: string;
}
