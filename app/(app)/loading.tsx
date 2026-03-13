export default function DashboardLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Header skeleton */}
      <div className="px-8 md:px-12 pt-10 pb-6 border-b border-[rgba(55,50,47,0.08)] flex-shrink-0">
        <div className="h-9 w-40 bg-[rgba(55,50,47,0.08)] rounded-lg animate-pulse" />
        <div className="h-4 w-56 bg-[rgba(55,50,47,0.06)] rounded animate-pulse mt-2" />
      </div>

      {/* Dashboard content skeleton */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-[20px] bg-white border border-[rgba(55,50,47,0.06)] shadow-[0_4px_24px_rgba(55,50,47,0.04)] p-6"
              >
                <div className="h-4 w-24 bg-[rgba(55,50,47,0.06)] rounded animate-pulse mb-3" />
                <div className="h-8 w-16 bg-[rgba(55,50,47,0.08)] rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Main content area */}
          <div className="rounded-[20px] bg-white border border-[rgba(55,50,47,0.06)] shadow-[0_4px_24px_rgba(55,50,47,0.04)] p-6">
            <div className="h-6 w-48 bg-[rgba(55,50,47,0.08)] rounded animate-pulse mb-4" />
            <div className="h-64 bg-[rgba(55,50,47,0.04)] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
