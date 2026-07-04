import { useState, useEffect } from 'react'

export default function PriceRangeSlider({ min = 0, max = 100000, minValue, maxValue, onChange, step = 500 }) {
  const [localMin, setLocalMin] = useState(minValue ?? min)
  const [localMax, setLocalMax] = useState(maxValue ?? max)

  useEffect(() => { setLocalMin(minValue ?? min) }, [minValue, min])
  useEffect(() => { setLocalMax(maxValue ?? max) }, [maxValue, max])

  const commit = (nextMin = localMin, nextMax = localMax) => onChange(nextMin, nextMax)

  const handleMinSlide = (e) => {
    const val = Math.min(Number(e.target.value), localMax - step)
    setLocalMin(val)
  }
  const handleMaxSlide = (e) => {
    const val = Math.max(Number(e.target.value), localMin + step)
    setLocalMax(val)
  }

  const handleMinTypeCommit = (e) => {
    let val = Number(e.target.value)
    if (Number.isNaN(val)) val = min
    val = Math.min(Math.max(val, min), localMax - step)
    setLocalMin(val)
    commit(val, localMax)
  }
  const handleMaxTypeCommit = (e) => {
    let val = Number(e.target.value)
    if (Number.isNaN(val)) val = max
    val = Math.max(Math.min(val, max), localMin + step)
    setLocalMax(val)
    commit(localMin, val)
  }

  const minPercent = ((localMin - min) / (max - min)) * 100
  const maxPercent = ((localMax - min) / (max - min)) * 100

  return (
    <div>
      <div className="relative h-4 mb-5 mt-2">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-200 rounded-full" />
        <div className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-primary-600 rounded-full" style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }} />
        <input
          type="range" min={min} max={max} step={step} value={localMin}
          onChange={handleMinSlide}
          onMouseUp={() => commit()}
          onTouchEnd={() => commit()}
          onKeyUp={() => commit()}
          aria-label="Minimum price"
          className="range-thumb absolute inset-0 w-full h-full"
          style={{ zIndex: localMin > max - (max - min) * 0.1 ? 5 : 3 }}
        />
        <input
          type="range" min={min} max={max} step={step} value={localMax}
          onChange={handleMaxSlide}
          onMouseUp={() => commit()}
          onTouchEnd={() => commit()}
          onKeyUp={() => commit()}
          aria-label="Maximum price"
          className="range-thumb absolute inset-0 w-full h-full"
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
          <input type="number" min={min} max={max} step={step} value={localMin}
            onChange={e => setLocalMin(Number(e.target.value))}
            onBlur={handleMinTypeCommit}
            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
            className="w-full pl-6 pr-2 py-2 bg-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
        <span className="text-gray-300 text-xs">to</span>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
          <input type="number" min={min} max={max} step={step} value={localMax}
            onChange={e => setLocalMax(Number(e.target.value))}
            onBlur={handleMaxTypeCommit}
            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
            className="w-full pl-6 pr-2 py-2 bg-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
      </div>
    </div>
  )
}
