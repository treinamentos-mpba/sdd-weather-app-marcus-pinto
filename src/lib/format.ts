const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  timeZone: 'UTC',
});
const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});
const referenceDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

function parseCalendarDate(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const calendarDate = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return null;
  }

  return calendarDate;
}

/** Retorna Hoje, Amanhã ou o dia da semana para uma previsão indexada. */
export function formatDayLabel(index: number, date: string): string {
  const calendarDate = parseCalendarDate(date);
  if (!calendarDate) return 'Data indisponível';
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  const weekday = weekdayFormatter.format(calendarDate);

  return `${weekday.charAt(0).toLocaleUpperCase('pt-BR')}${weekday.slice(1)}`;
}

/** Retorna uma data de calendário no formato curto DD/MM. */
export function getShortDate(date: string): string {
  const calendarDate = parseCalendarDate(date);
  if (!calendarDate) return '—';

  return shortDateFormatter.format(calendarDate);
}

/** Formata o horário local de observação sem reinterpretá-lo no fuso do dispositivo. */
export function formatWeatherReference(observedAt: string | null, timezone: string | null): string {
  if (!observedAt) return 'Referência temporal indisponível';

  const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(observedAt);
  if (!match) return 'Referência temporal indisponível';

  const calendarDate = parseCalendarDate(match[1]);
  if (!calendarDate) return 'Referência temporal indisponível';

  const timezoneLabel = timezone?.trim() || 'fuso indisponível';
  return `Referência temporal: ${referenceDateFormatter.format(calendarDate)} às ${match[2]}:${match[3]} (${timezoneLabel})`;
}
