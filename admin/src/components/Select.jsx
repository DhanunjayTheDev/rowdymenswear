import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export default function Select({ value, onChange, options, placeholder = 'Select...', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full h-12 flex items-center justify-between gap-2 px-4 bg-white border border-slate-200 rounded-lg text-sm text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors">
        <span className={selected ? 'text-slate-900' : 'text-slate-400'}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full bg-white rounded-lg shadow-lg border border-slate-100 py-1 max-h-64 overflow-y-auto animate-fade-in">
          {options.map(o => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false) }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors ${
                o.value === value ? 'text-primary-600 font-medium' : 'text-slate-700'
              }`}>
              {o.label}
              {o.value === value && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
