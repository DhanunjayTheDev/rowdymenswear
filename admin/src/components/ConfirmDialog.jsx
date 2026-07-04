import { useState, useEffect } from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  danger = false, requireInput = false, inputPlaceholder = '', onConfirm, onClose,
}) {
  const [value, setValue] = useState('')

  useEffect(() => { if (open) setValue('') }, [open])

  if (!open) return null

  const canConfirm = !requireInput || value.trim().length > 0

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-red-50' : 'bg-primary-50'}`}>
          {danger ? <AlertTriangle size={22} className="text-red-600" /> : <HelpCircle size={22} className="text-primary-600" />}
        </div>
        <h3 className="font-heading text-lg font-bold text-slate-900">{title}</h3>
        {message && <p className="text-sm text-slate-500 mt-1.5">{message}</p>}

        {requireInput && (
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={inputPlaceholder}
            rows={3}
            autoFocus
            className="w-full mt-4 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
          />
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
            {cancelLabel}
          </button>
          <button
            onClick={() => onConfirm(requireInput ? value.trim() : undefined)}
            disabled={!canConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'
            }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
