import 'mahgen'
import { FC, memo, useEffect, useRef } from 'react'

interface MahgenElement extends HTMLElement {
  ['data-seq']: string
  ['data-show-err']: string
  ['data-river-mode']: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'mah-gen': React.DetailedHTMLProps<React.HTMLAttributes<MahgenElement>, MahgenElement>
    }
  }
}

interface MahgenProps {
  sequence: string
  showError?: boolean
  riverMode?: boolean
  size?: 'small' | 'large'
}

const Mahgen: FC<MahgenProps> = memo(({ sequence, showError, riverMode, size }) => {
  const ref = useRef<MahgenElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.shadowRoot!.querySelector('img')!.style.height = size === 'small' ? '50px' : 'unset'
    }
  }, [size])

  return (
    <>
      <mah-gen
        ref={ref}
        data-seq={sequence.replace('||', '|')}
        {...(showError ? { ['data-show-err']: 'true' } : {})}
        {...(riverMode ? { ['data-river-mode']: 'true' } : {})}
      />
    </>
  )
})

export default Mahgen
