import { HiX } from 'react-icons/hi'

export default function QuickFilterSheet({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up flex flex-col" style={{ maxHeight: '70vh' }}>
        <div className="relative flex-shrink-0 pt-3 pb-2 px-5 flex items-center justify-between">
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-10 h-1 bg-gray-300 rounded-full" />
          <span className="font-heading text-base font-bold pt-2">{title}</span>
          <button onClick={onClose} className="p-1.5 mt-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <HiX size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6 flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
