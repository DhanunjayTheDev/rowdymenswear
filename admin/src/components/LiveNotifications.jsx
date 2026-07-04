import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, PackagePlus, PackageX, Tag, Percent, RefreshCw, Users } from 'lucide-react'
import DynamicIsland from './DynamicIsland'
import socket from '../lib/socket'
import { playChime } from '../lib/playChime'

const EVENT_META = {
  'order:new': { icon: ShoppingBag, duration: 60000, sound: true },
  'order:updated': { icon: RefreshCw, duration: 3000 },
  'product:created': { icon: PackagePlus, duration: 3000 },
  'product:updated': { icon: RefreshCw, duration: 3000 },
  'product:deleted': { icon: PackageX, duration: 3000 },
  'category:created': { icon: Tag, duration: 3000 },
  'category:updated': { icon: RefreshCw, duration: 3000 },
  'category:deleted': { icon: Tag, duration: 3000 },
  'coupon:created': { icon: Percent, duration: 3000 },
  'coupon:updated': { icon: RefreshCw, duration: 3000 },
  'coupon:deleted': { icon: Percent, duration: 3000 },
  'customer:created': { icon: Users, duration: 3000 },
  'customer:updated': { icon: RefreshCw, duration: 3000 },
  'customer:deleted': { icon: Users, duration: 3000 },
}

export default function LiveNotifications() {
  const [current, setCurrent] = useState(null)
  const queueRef = useRef([])
  const timerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const enqueue = (event, payload) => {
      const meta = EVENT_META[event]
      if (!meta) return
      queueRef.current.push({ event, ...payload, ...meta })
      if (meta.sound) playChime()
      processQueue()
    }

    const processQueue = () => {
      setCurrent(prev => {
        if (prev) return prev
        const next = queueRef.current.shift()
        if (!next) return null
        timerRef.current = setTimeout(() => {
          setCurrent(null)
          setTimeout(processQueue, 300)
        }, next.duration)
        return next
      })
    }

    const events = Object.keys(EVENT_META)
    const handlers = events.map(event => {
      const handler = (payload) => enqueue(event, payload)
      socket.on(event, handler)
      return { event, handler }
    })

    return () => {
      handlers.forEach(({ event, handler }) => socket.off(event, handler))
      clearTimeout(timerRef.current)
    }
  }, [])

  const dismiss = () => {
    clearTimeout(timerRef.current)
    setCurrent(null)
  }

  if (!current) return null

  const isNewOrder = current.event === 'order:new'
  const Icon = current.icon

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] cursor-pointer" onClick={() => {
      if (current.link) navigate(current.link)
      dismiss()
    }}>
      <DynamicIsland state={isNewOrder ? 'long' : 'compact'}>
        {isNewOrder ? (
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="relative flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-60" />
              <div className="relative w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center">
                <Icon size={17} />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight whitespace-nowrap">New Order Received!</p>
              <p className="text-xs text-white/60">{current.customerName} · ₹{current.total?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-4 py-3">
            <Icon size={16} className="text-white/80 flex-shrink-0" />
            <p className="text-xs font-medium">{current.message}</p>
          </div>
        )}
      </DynamicIsland>
    </div>
  )
}
