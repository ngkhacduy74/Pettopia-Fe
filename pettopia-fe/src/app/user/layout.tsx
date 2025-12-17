'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import UserShell from './UserShell'
import { getVipStatus } from '@/services/user/userService'

const Chat = dynamic(() => import('@/components/Chat'), {
  loading: () => null,
  ssr: false
})

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [showChat, setShowChat] = useState(false)
  const [isVip, setIsVip] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch VIP status on mount
  useEffect(() => {
    const fetchVipStatus = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        if (!token) {
          setIsLoading(false)
          return
        }

        const vipData = await getVipStatus()
        if (vipData && vipData.is_vip) {
          setIsVip(true)
        } else {
          setIsVip(false)
        }
      } catch (error) {
        console.error('Error fetching VIP status:', error)
        setIsVip(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVipStatus()
  }, [])

  const chatSuggestions = useMemo(() => [
    { icon: '🐾', text: 'Quản lí hồ sơ Pet', tag: 'New' },
    { icon: '📝', text: 'Viết nhật ký cho pet' },
    { icon: '📊', text: 'Xem báo cáo sức khỏe' },
    { icon: '✅', text: 'Tạo nhắc nhở khám định kỳ', tag: 'New' }
  ], [])

  return (
    <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
      <UserShell>{children}</UserShell>

      {/* Chat Widget - Only for VIP users */}
      {isVip && (
        <>
          <Chat
            showChat={showChat}
            setShowChat={setShowChat}
            chatSuggestions={chatSuggestions}
          />

          {/* Chat Button */}
          <button
            onClick={() => setShowChat(true)}
            className={`fixed bottom-4 right-4 w-15 h-15 sm:w-16 sm:h-16 sm:bottom-6 sm:right-6 bg-gradient-to-br from-teal-500 to-cyan-700 rounded-full shadow-lg flex items-center justify-center text-xl sm:text-2xl hover:scale-110 transition-all duration-200 z-40 hover:shadow-xl group ${showChat ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-label="Mở chat"
          >
            <span className="group-hover:hidden">
              <img src="/sampleimg/AiCat-static.gif" alt="Chat Icon" className="w-full h-full object-cover" />
            </span>
            <span className="hidden group-hover:inline">
              <img src="/sampleimg/AiCat.gif" alt="Chat Icon" className="w-full h-full object-cover" />
            </span>
          </button>
        </>
      )}
    </div>
  );
}


