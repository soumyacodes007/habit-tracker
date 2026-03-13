export default function HistoryLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Header skeleton */}
      <div className="px-8 md:px-12 pt-10 pb-6 border-b border-[rgba(55,50,47,0.08)] flex-shrink-0">
        <div className="h-9 w-32 bg-[rgba(55,50,47,0.08)] rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-[rgba(55,50,47,0.06)] rounded animate-pulse mt-2" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        <div className="space-y-6">
          {/* Heatmap skeleton */}
          <div className="rounded-[20px] bg-white border border-[rgba(55,50,47,0.06)] shadow-[0_4px_24px_rgba(55,50,47,0.04)] p-6">
            <div className="h-6 w-48 bg-[rgba(55,50,47,0.08)] rounded animate-pulse mb-4" />
            <div className="h-32 bg-[rgba(55,50,47,0.04)] rounded-lg animate-pulse" />
          </div>

          {/* Calendar skeleton */}
          <div className="rounded-[20px] bg-white border border-[rgba(55,50,47,0.06)] shadow-[0_4px_24px_rgba(55,50,47,0.04)] p-6">
            <div className="h-6 w-40 bg-[rgba(55,50,47,0.08)] rounded animate-pulse mb-4" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-[rgba(55,50,47,0.04)] rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
