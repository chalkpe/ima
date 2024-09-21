import { DetailedHTMLProps, FC, HTMLAttributes } from 'react'
import { WiredCard } from 'react-wired-elements'
import useSketchToggle from '@ima/client/hooks/useSketchToggle'

type SketchBoxProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const SketchBox: FC<SketchBoxProps> = ({ style, children, ...props }) => {
  const toggle = useSketchToggle()
  return (
    <div {...props}>
      {toggle ? (
        <WiredCard elevation={1} style={{ padding: '1vmin', userSelect: 'none', ...style }}>
          {children}
        </WiredCard>
      ) : (
        <div
          style={{
            userSelect: 'none',
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

export default SketchBox
