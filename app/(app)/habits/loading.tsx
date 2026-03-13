export default function HabitsLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Header skeleton */}
      <div className="px-8 md:px-12 pt-10 pb-6 border-b border-[rgba(55,50,47,0.08)] flex-shrink-0">
        <div className="h-9 w-32 bg-[rgba(55,50,47,0.08)] rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-[rgba(55,50,47,0.06)] rounded animate-pulse mt-2" />
      </div>

      {/* Habit checklist skeleton */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-[20px] bg-white border border-[rgba(55,50,47,0.06)] shadow-[0_4px_24px_rgba(55,50,47,0.04)] p-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-md bg-[rgba(55,50,47,0.08)] animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 w-40 bg-[rgba(55,50,47,0.08)] rounded animate-pulse mb-2" />
                  <div className="h-3 w-56 bg-[rgba(55,50,47,0.06)] rounded animate-pulse" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-[rgba(55,50,47,0.08)] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
