interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      aria-labelledby="weather-error-title"
      className="rounded-lg border border-red-300/25 bg-red-400/10 p-4 text-white backdrop-blur-md"
      role="alert"
    >
      <h2 className="text-base font-semibold" id="weather-error-title">
        Não foi possível consultar o clima
      </h2>
      <p className="mt-1 text-sm text-white/75">{message}</p>
      <button
        className="mt-4 min-h-11 rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </section>
  );
}
