import { CSSProperties, DetailedHTMLProps, FC, HTMLAttributes, MouseEventHandler, useCallback, useMemo } from 'react'
import { WiredCard } from 'react-wired-elements'
import useSketchToggle from '@ima/client/hooks/useSketchToggle'

type SketchButtonProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  loading?: boolean
  disabled?: boolean
  active?: boolean
  onClick: MouseEventHandler<HTMLDivElement>
}

const SketchButton: FC<SketchButtonProps> = ({ onClick, loading, disabled, active, style, children, ...props }) => {
  const { toggle } = useSketchToggle()

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => !loading && !disabled && onClick(e),
    [disabled, loading, onClick]
  )

  const styles: CSSProperties = useMemo(() => {
    if (disabled || loading) return { opacity: 0.5, color: 'rgba(50, 50, 50, 0.5)' }
    return {}
  }, [disabled, loading])

  return (
    <div
      onClick={handleClick}
      style={{ cursor: loading ? 'progress' : disabled ? 'not-allowed' : 'pointer' }}
      {...props}
    >
      {toggle ? (
        <WiredCard
          elevation={active ? 3 : 1}
          style={{
            padding: '1vmin',
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...styles,
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
            border: `0.5vmin solid rgba(50, 50, 50, ${active ? 1 : 0.25})`,
            ...styles,
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
