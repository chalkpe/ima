// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { Mahgen } from 'mahgen'
import { FC, MouseEventHandler, useEffect, useState } from 'react'

interface MahgenProps {
  size: number
  sequence: string
  riverMode?: boolean
  onClick?: MouseEventHandler
}

const MahgenElement: FC<MahgenProps> = ({ size, sequence, riverMode, onClick }) => {
  const [src, setSrc] = useState('')

  useEffect(() => {
    Mahgen.render(sequence, riverMode ?? false).then((src: string) => setSrc(src))
  }, [riverMode, sequence])

  return <img src={src} onClick={onClick} style={{ width: `${size}vmin` }} />
}

export default MahgenElement
