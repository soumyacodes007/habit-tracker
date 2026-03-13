export default function ManageHabitsLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Header skeleton */}
      <div className="px-8 md:px-12 pt-10 pb-6 border-b border-[rgba(55,50,47,0.08)] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="h-9 w-48 bg-[rgba(55,50,47,0.08)] rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-[rgba(55,50,47,0.08)] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Habit cards skeleton */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-[20px] bg-white border border-[rgba(55,50,47,0.06)] shadow-[0_4px_24px_rgba(55,50,47,0.04)] p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(55,50,47,0.08)] animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-[rgba(55,50,47,0.08)] rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-[rgba(55,50,47,0.06)] rounded animate-pulse" />
                </div>
              </div>
              <div className="h-16 bg-[rgba(55,50,47,0.04)] rounded-lg animate-pulse mb-4" />
              <div className="flex gap-2">
                <div className="h-8 flex-1 bg-[rgba(55,50,47,0.04)] rounded animate-pulse" />
                <div className="h-8 w-8 bg-[rgba(55,50,47,0.04)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
