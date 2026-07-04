import { useEffect, useState, useCallback } from 'react'

export default function useReveal() {
  const [node, setNode] = useState(null)
  const ref = useCallback((el) => setNode(el), [])

  useEffect(() => {
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('visible')
          observer.unobserve(node)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return ref
}
