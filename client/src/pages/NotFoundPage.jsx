import { Link } from 'react-router-dom'
import FuzzyText from '../components/FuzzyText'
import { HiArrowRight } from 'react-icons/hi'

export default function NotFoundPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-brand-black px-6 py-20 text-center page-enter">
      <FuzzyText
        fontSize="clamp(4rem, 18vw, 12rem)"
        fontWeight={900}
        color="#ffffff"
        baseIntensity={0.15}
        hoverIntensity={0.4}
        enableHover
      >
        404
      </FuzzyText>
      <p className="text-gray-400 mt-6 max-w-sm mx-auto">
        This page ran off the block. Let's get you back to the crew.
      </p>
      <Link to="/"
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-semibold text-sm btn-press shadow-2xl shadow-red-600/25 transition-all group mt-8">
        Back to Home <HiArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  )
}
