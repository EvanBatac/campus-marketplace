export default function LoadingSkeleton({
  variant = "cards",
  count = 6,
  label = "Loading...",
}) {
  return (
    <div role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className={
          variant === "cards"
            ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }
      >
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white motion-safe:animate-pulse"
          >
            {(variant === "cards" || variant === "detail") && (
              <div
                className={`${variant === "detail" ? "h-72" : "h-52"} bg-slate-200`}
              />
            )}
            <div className="space-y-3 p-5">
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              {variant !== "conversations" && (
                <div className="mt-6 h-7 w-1/3 rounded bg-slate-200" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
