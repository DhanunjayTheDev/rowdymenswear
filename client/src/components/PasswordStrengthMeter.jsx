const calculateStrength = (password) => {
  if (!password) return { score: 0, level: 'empty' }

  let score = 0
  if (password.length > 5) score += 1
  if (password.length > 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  let level = 'empty'
  if (score === 0) level = 'empty'
  else if (score <= 2) level = 'weak'
  else if (score <= 4) level = 'medium'
  else if (score <= 5) level = 'strong'
  else level = 'very-strong'

  return { score, level }
}

const strengthColors = {
  empty: 'bg-gray-200',
  weak: 'bg-red-500',
  medium: 'bg-orange-500',
  strong: 'bg-green-500',
  'very-strong': 'bg-emerald-500',
}

const strengthTextColors = {
  empty: 'text-gray-400',
  weak: 'text-red-500',
  medium: 'text-orange-500',
  strong: 'text-green-500',
  'very-strong': 'text-emerald-500',
}

const strengthLabels = {
  empty: '',
  weak: 'Weak',
  medium: 'Medium',
  strong: 'Strong',
  'very-strong': 'Very Strong',
}

export default function PasswordStrengthMeter({ password, showScore = true }) {
  const { score, level } = calculateStrength(password)
  if (!password) return null

  return (
    <div className="space-y-1.5 mt-2">
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}
            className={`h-full flex-1 rounded-full transition-all duration-300 ${
              i < Math.min(Math.ceil(score / 1.5), 4) ? strengthColors[level] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {showScore && (
        <p className={`text-xs font-medium ${strengthTextColors[level]}`}>{strengthLabels[level]}</p>
      )}
    </div>
  )
}
