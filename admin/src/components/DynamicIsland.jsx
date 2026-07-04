import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

const radiusMapping = { idle: 20, compact: 27, long: 30, expanded: 32 }

// Width/height are content-driven (no fixed pixel caps that could clip a longer
// message) — framer's `layout` prop smoothly animates size changes between states.
export const DynamicIsland = ({ state = 'idle', children, className }) => {
  return (
    <motion.div
      layout
      initial={false}
      animate={{ borderRadius: radiusMapping[state] }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
      className={cn(
        'bg-black overflow-hidden flex items-center w-fit min-w-[120px] max-w-[92vw] sm:max-w-[440px] shadow-2xl border border-zinc-800',
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={state}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-white w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default DynamicIsland
