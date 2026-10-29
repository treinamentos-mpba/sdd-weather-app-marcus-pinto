import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const inputId = useId();
  const validationId = `${inputId}-validation`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setValidationMessage('Informe o nome da cidade.');
      return;
    }

    setValidationMessage(null);
    onSearch(trimmedCity);
  }

  return (
    <form
      aria-label="Buscar uma cidade"
      className="flex w-full items-end gap-3 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-md"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="min-w-0 flex-1">
        <label className="mb-1 block text-sm font-medium text-white" htmlFor={inputId}>
          Cidade
        </label>
        <input
          autoComplete="off"
          aria-describedby={validationMessage ? validationId : undefined}
          aria-invalid={validationMessage !== null}
          className="min-h-11 w-full rounded-md border border-white/10 bg-night-900/70 px-3 py-2 text-white placeholder:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id={inputId}
          name="city"
          onChange={(event) => {
            setCity(event.target.value);
            if (validationMessage) setValidationMessage(null);
          }}
          placeholder="Ex.: Lisboa"
          type="search"
          value={city}
        />
        {validationMessage && (
          <p className="mt-1 text-sm text-red-200" id={validationId} role="alert">
            {validationMessage}
          </p>
        )}
      </div>
      <button
        className="min-h-11 shrink-0 rounded-md bg-accent-500 px-4 py-2 font-semibold text-night-900 transition-colors enabled:hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
