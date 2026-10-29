export default function LoadingState() {
  return (
    <div
      aria-live="polite"
      className="flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/80 backdrop-blur-md"
      role="status"
    >
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-accent-400"
      />
      <span>Carregando previsão do tempo...</span>
    </div>
  );
}
