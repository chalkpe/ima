import { useEffect, useMemo, useState } from 'react'

const useSketchToggle = () => {
  const [vmin, setVmin] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setVmin(Math.min(window.innerWidth, window.innerHeight) / 100)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggle = useMemo(() => vmin >= 5, [vmin])
  return toggle
}

export default useSketchToggle
