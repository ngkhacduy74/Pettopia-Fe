'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const UserNavbarLazy = dynamic(() => import('@/components/UserNavbar'), {
  loading: () => (
    <div className="w-64 bg-white border-r border-teal-100 flex flex-col shadow-sm">
      <div className="p-3 border-b border-teal-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-28 mb-1 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-36 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="p-2 space-y-2">
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  ),
})

export default function UserShell({ children }: { children: React.ReactNode }) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <>
      <UserNavbarLazy setShowSearch={setShowSearch} showSearch={showSearch} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </>
  )
}


