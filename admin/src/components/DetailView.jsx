// Shared "view details" building blocks used inside <Drawer> panels across
// Products/Orders/Users/Categories/Coupons, so every read-only detail view
// shares one modern look (dark hero header + card-grid fields) instead of
// each page hand-rolling its own plain label:value rows.

export function DetailHero({ leading, title, subtitle, meta }) {
  return (
    <div className="-mx-6 -mt-5 mb-5 px-6 pt-7 pb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute right-8 top-14 w-14 h-14 rounded-full bg-primary-500/10 pointer-events-none" />
      <div className="relative flex items-center gap-4">
        {leading}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-bold leading-tight truncate">{title}</h3>
          {subtitle && <p className="text-white/50 text-xs mt-1 truncate">{subtitle}</p>}
          {meta && <div className="mt-2.5 flex flex-wrap items-center gap-1.5">{meta}</div>}
        </div>
      </div>
    </div>
  )
}

// Dark tones — for pills on the DetailHero's dark gradient background
const TONES_DARK = {
  green: 'bg-green-500/15 text-green-300 ring-1 ring-green-500/20',
  red: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/20',
  amber: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20',
  blue: 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20',
  slate: 'bg-white/10 text-white/70 ring-1 ring-white/10',
}
const DOT_TONES_DARK = {
  green: 'bg-green-400',
  red: 'bg-red-400',
  amber: 'bg-amber-400',
  blue: 'bg-blue-400',
  slate: 'bg-white/50',
}

// Light tones — for pills on white/light card backgrounds (tables, lists)
const TONES_LIGHT = {
  green: 'bg-green-100 text-green-700 ring-1 ring-green-200',
  red: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  amber: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  blue: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
}
const DOT_TONES_LIGHT = {
  green: 'bg-green-600',
  red: 'bg-red-600',
  amber: 'bg-amber-600',
  blue: 'bg-blue-600',
  slate: 'bg-slate-500',
}

export function Pill({ tone = 'slate', dot = true, dark = false, children }) {
  const tones = dark ? TONES_DARK : TONES_LIGHT
  const dotTones = dark ? DOT_TONES_DARK : DOT_TONES_LIGHT
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${tones[tone]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotTones[tone]}`} />}
      {children}
    </span>
  )
}

export function DetailSection({ icon: Icon, title, children, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Icon size={13} className="text-primary-600" />
        </div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</h4>
      </div>
      {children}
    </div>
  )
}

export function DetailGrid({ children, className = '' }) {
  return <div className={`grid grid-cols-2 gap-2.5 ${className}`}>{children}</div>
}

export function DetailField({ label, value, icon: Icon, full = false }) {
  return (
    <div className={`bg-slate-50 rounded-xl p-3 ${full ? 'col-span-2' : ''}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1 flex items-center gap-1">
        {Icon && <Icon size={11} className="text-slate-400" />}{label}
      </p>
      <div className="text-sm font-semibold text-slate-800 break-words">{value}</div>
    </div>
  )
}
