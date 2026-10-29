import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentUnit: Unit) {
    let nextUnit: Unit | undefined;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextUnit = currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextUnit = currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    } else if (event.key === 'Home') {
      nextUnit = 'celsius';
    } else if (event.key === 'End') {
      nextUnit = 'fahrenheit';
    }

    if (!nextUnit) return;

    event.preventDefault();
    onChange(nextUnit);

    if (nextUnit === 'celsius') {
      celsiusButtonRef.current?.focus();
    } else {
      fahrenheitButtonRef.current?.focus();
    }
  }

  const buttonClassName =
    'min-h-10 min-w-10 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-md"
      role="group"
    >
      <button
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        className={`${buttonClassName} ${unit === 'celsius' ? 'bg-accent-500 text-night-900' : 'text-white/75 hover:bg-white/10'}`}
        onClick={() => onChange('celsius')}
        onKeyDown={(event) => handleKeyDown(event, 'celsius')}
        ref={celsiusButtonRef}
        tabIndex={unit === 'celsius' ? 0 : -1}
        type="button"
      >
        °C
      </button>
      <button
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        className={`${buttonClassName} ${unit === 'fahrenheit' ? 'bg-accent-500 text-night-900' : 'text-white/75 hover:bg-white/10'}`}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={(event) => handleKeyDown(event, 'fahrenheit')}
        ref={fahrenheitButtonRef}
        tabIndex={unit === 'fahrenheit' ? 0 : -1}
        type="button"
      >
        °F
      </button>
    </div>
  );
}
