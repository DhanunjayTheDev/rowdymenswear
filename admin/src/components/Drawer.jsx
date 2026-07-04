import { X } from 'lucide-react'

export default function Drawer({ open, onClose, title, children, footer }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70]" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-fade-in">
        {title ? (
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
            <h2 className="font-heading text-lg font-bold text-slate-900">{title}</h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        ) : (
          <button onClick={onClose} className="absolute right-4 top-4 z-10 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} />
          </button>
        )}
        <div className={`flex-1 overflow-y-auto px-6 ${title ? 'py-5' : 'pt-5 pb-5'}`}>
          {children}
        </div>
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
