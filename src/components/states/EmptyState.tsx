interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section
      aria-labelledby="weather-empty-title"
      aria-live="polite"
      className="rounded-lg border border-white/10 bg-white/5 px-5 py-8 text-center text-white backdrop-blur-md"
      role="status"
    >
      <h2 className="text-lg font-semibold" id="weather-empty-title">
        {title}
      </h2>
      <p className="mt-2 text-sm text-white/65">{hint}</p>
    </section>
  );
}
