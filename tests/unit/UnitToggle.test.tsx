import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather
        city={{ name: 'Lisboa', latitude: 38.7167, longitude: -9.1333 }}
        current={{
          temperatureC: 0,
          weatherCode: 0,
          observedAt: '2026-10-29T14:00',
          humidityPercent: null,
          windSpeedKmh: null,
          precipitationMm: null,
          pressureHPa: null,
        }}
        unit={unit}
        timezone="Europe/Lisbon"
      />
    </>
  );
}

describe('UnitToggle com CurrentWeather', () => {
  it('exibe 32 °F após selecionar Fahrenheit para 0 °C', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    expect(screen.getByText('0 °C')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('32 °F')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
