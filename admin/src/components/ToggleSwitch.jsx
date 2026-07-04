export default function ToggleSwitch({ checked, onChange, activeLabel = 'Active', inactiveLabel = 'Inactive' }) {
  return (
    <button
      type="button"
      onClick={onChange}
      title={checked ? activeLabel : inactiveLabel}
      className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-green-500' : 'bg-red-400'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
