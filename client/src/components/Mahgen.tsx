// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { Mahgen } from 'mahgen'
import { FC, MouseEventHandler, useEffect, useState } from 'react'

interface MahgenProps {
  sequence: string
  riverMode?: boolean
  size?: 'small' | 'large'
  onClick?: MouseEventHandler
}

const MahgenElement: FC<MahgenProps> = ({ sequence, riverMode, onClick }) => {
  const [src, setSrc] = useState('')

  useEffect(() => {
    Mahgen.render(sequence, riverMode ?? false).then((src: string) => setSrc(src))
  }, [riverMode, sequence])

  return (
    <img
      src={src}
      onClick={onClick}
    />
  )
}

export default MahgenElement
