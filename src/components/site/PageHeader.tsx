export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="border-b border-border bg-primary-soft/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-4xl uppercase leading-[0.95] sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
