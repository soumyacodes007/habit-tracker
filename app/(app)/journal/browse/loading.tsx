export default function BrowseJournalLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Header skeleton */}
      <div className="px-8 md:px-12 pt-10 pb-6 border-b border-[rgba(55,50,47,0.08)] flex-shrink-0">
        <div className="h-9 w-48 bg-[rgba(55,50,47,0.08)] rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-[rgba(55,50,47,0.06)] rounded animate-pulse mt-2" />
      </div>

      {/* Entry cards skeleton */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-[20px] bg-white border border-[rgba(55,50,47,0.06)] shadow-[0_4px_24px_rgba(55,50,47,0.04)] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-40 bg-[rgba(55,50,47,0.08)] rounded animate-pulse" />
                <div className="h-4 w-24 bg-[rgba(55,50,47,0.06)] rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-[rgba(55,50,47,0.04)] rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-[rgba(55,50,47,0.04)] rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-[rgba(55,50,47,0.04)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
