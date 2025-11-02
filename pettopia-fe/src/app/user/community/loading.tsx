export default function CommunityLoading() {
  return (
    <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
      {/* Sidebar Navigation Skeleton */}
      <div className="w-64 bg-white border-r border-teal-200 p-6">
        <div className="space-y-6">
          {/* Logo skeleton */}
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          
          {/* Navigation items skeleton */}
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-y-auto">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search Bar Skeleton */}
              <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Categories Skeleton */}
              <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-1/3"></div>
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Posts List Skeleton */}
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-1/2"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
