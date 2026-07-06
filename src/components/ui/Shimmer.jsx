export function ShimmerCard() {
  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm">
      <div className="shimmer rounded-xl h-32 mb-3" />
      <div className="shimmer rounded h-3 w-3/4 mb-2" />
      <div className="shimmer rounded h-3 w-1/2" />
    </div>
  );
}

export function ShimmerList({ count = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface rounded-2xl p-4 shadow-sm flex gap-3">
          <div className="shimmer rounded-xl w-12 h-12 flex-shrink-0" />
          <div className="flex-1">
            <div className="shimmer rounded h-3 w-3/4 mb-2" />
            <div className="shimmer rounded h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
