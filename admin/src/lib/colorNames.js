const PALETTE = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#E53935' },
  { name: 'Blue', hex: '#1E88E5' },
  { name: 'Green', hex: '#43A047' },
  { name: 'Grey', hex: '#9E9E9E' },
  { name: 'Navy', hex: '#1A237E' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Brown', hex: '#795548' },
  { name: 'Beige', hex: '#F5F5DC' },
]

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

export function nearestColorName(hex) {
  const rgb = hexToRgb(hex)
  let closest = PALETTE[0]
  let minDist = Infinity
  for (const c of PALETTE) {
    const crgb = hexToRgb(c.hex)
    const dist = (rgb.r - crgb.r) ** 2 + (rgb.g - crgb.g) ** 2 + (rgb.b - crgb.b) ** 2
    if (dist < minDist) { minDist = dist; closest = c }
  }
  return closest.name
}

export { PALETTE as COLOR_PALETTE }
