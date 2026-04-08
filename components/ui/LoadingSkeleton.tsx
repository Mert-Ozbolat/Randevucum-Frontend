export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card dark:border-neutral-700 dark:bg-neutral-800">
      <div className="aspect-[4/3] animate-pulse bg-neutral-100 dark:bg-neutral-700" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-600" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100 dark:bg-neutral-700" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-700" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-700" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex h-16 animate-pulse items-center gap-4 rounded-xl bg-neutral-100 px-4"
        >
          <div className="h-4 w-24 rounded bg-neutral-200" />
          <div className="h-4 flex-1 rounded bg-neutral-200" />
          <div className="h-8 w-20 rounded-lg bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}
