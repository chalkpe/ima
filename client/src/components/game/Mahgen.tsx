// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { Mahgen } from 'mahgen'
import { FC, useEffect, useState } from 'react'

interface MahgenProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  size: number
  sequence: string
  riverMode?: boolean
}

const memory = new Map<string, string>()
const riverMemory = new Map<string, string>()

const MahgenElement: FC<MahgenProps> = ({ size, sequence, riverMode, style, ...rest }) => {
  const [src, setSrc] = useState('')

  useEffect(() => {
    const mem = riverMode ? riverMemory : memory
    const data = mem.get(sequence)
    if (data) {
      setSrc(data)
    } else {
      Mahgen.render(sequence, riverMode ?? false).then((src: string) => {
        setSrc(src)
        mem.set(sequence, src)
      })
    }
  }, [riverMode, sequence])

  return (
    <img
      {...rest}
      src={src}
      style={
        ['_', 'v'].includes(sequence[0])
          ? { ...style, width: 'fit-content', height: `${size}vmin` }
          : { ...style, width: `${size}vmin`, height: 'fit-content', userSelect: 'none' }
      }
    />
  )
}

export default MahgenElement
