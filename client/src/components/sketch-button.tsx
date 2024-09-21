import { DetailedHTMLProps, FC, HTMLAttributes, MouseEventHandler, useCallback } from 'react'
import { WiredCard } from 'react-wired-elements'
import useSketchToggle from '@ima/client/hooks/useSketchToggle'

type SketchButtonProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  loading?: boolean
  disabled?: boolean
  onClick: MouseEventHandler<HTMLDivElement>
}

const SketchButton: FC<SketchButtonProps> = ({ onClick, loading, disabled, style, children, ...props }) => {
  const toggle = useSketchToggle()

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => !loading && !disabled && onClick(e),
    [disabled, loading, onClick]
  )

  return (
    <div
      onClick={handleClick}
      style={{ cursor: loading ? 'progress' : disabled ? 'not-allowed' : 'pointer' }}
      {...props}
    >
      {toggle ? (
        <WiredCard
          elevation={1}
          style={{
            padding: '1vmin',
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...style,
          }}
        >
          {children}
        </WiredCard>
      ) : (
        <div
          style={{
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'content-box',
            border: '0.5vmin solid rgba(50, 50, 50, 0.5)',
            ...style,
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export default SketchButton
