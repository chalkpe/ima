// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { Mahgen } from 'mahgen'
import { CSSProperties, FC, useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import { tileImageAtom } from '@ima/client/store/tileImage'
import { convertTileToCode } from '@ima/client/utils/tile'
import type { SimpleTile, Tile } from '@ima/server/types/tile'

interface MahgenProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  size: number
  tile: Tile | SimpleTile
  dim?: boolean
  rotate?: boolean
  stack?: boolean
}

const MahgenElement: FC<MahgenProps> = ({ size, tile, rotate, stack, dim, style, ...rest }) => {
  const [src, setSrc] = useState('')
  const memory = useAtomValue(tileImageAtom)

  useEffect(() => {
    const code = convertTileToCode(tile)
    if (memory.has(code)) setSrc(memory.get(code) ?? '')
    else Mahgen.render(code).then((src: string) => [setSrc(src), memory.set(code, src)])
  }, [memory, tile])

  const commonStyle: CSSProperties = {
    ...style,
    userSelect: 'none',
    filter: dim ? 'brightness(0.5)' : '',
  }

  return (
    <img
      {...rest}
      src={src}
      style={
        rotate
          ? {
              ...commonStyle,
              width: `${size}vmin`,
              minHeight: `calc(${size}vmin * 10/7)`,
              marginBottom: stack ? `calc(-${size}vmin * 6/7)` : '',
              marginRight: stack ? '' : `calc(${size}vmin * 3/7)`,
              transformOrigin: 'bottom left',
              transform:
                `translateY(-${size}vmin) rotate(90deg)` + (stack ? ` translateX(calc(-${size}vmin * 3/7))` : ''),
            }
          : { ...commonStyle, width: `${size}vmin`, minHeight: `calc(${size}vmin * 10/7)` }
      }
    />
  )
}

export default MahgenElement
