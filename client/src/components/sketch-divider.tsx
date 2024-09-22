import { DetailedHTMLProps, FC, HTMLAttributes } from 'react'
import { WiredDivider } from 'react-wired-elements'
import useSketchToggle from '@ima/client/hooks/useSketchToggle'

type SketchBoxProps = Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'children'>

const SketchBox: FC<SketchBoxProps> = ({ style, ...props }) => {
  const { toggle } = useSketchToggle()
  return (
    <div {...props}>
      {toggle ? (
        <WiredDivider elevation={1} />
      ) : (
        <div
          style={{
            width: '100%',
            userSelect: 'none',
            boxSizing: 'content-box',
            borderTop: '0.5vmin solid rgba(50, 50, 50, 0.5)',
            ...style,
          }}
        />
      )}
    </div>
  )
}

export default SketchBox
