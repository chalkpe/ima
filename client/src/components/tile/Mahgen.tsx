import { CSSProperties, FC, useMemo } from 'react'
import Rand from 'rand-seed'
import { convertTileToCode } from '@ima/client/utils/tile'
import type { SimpleTile, Tile } from '@ima/server/types/tile'

interface MahgenProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  size: number
  tile: Tile | SimpleTile
  dim?: boolean
  rotate?: boolean
  stack?: boolean
  natural?: boolean
}

const MahgenElement: FC<MahgenProps> = ({ size, tile, dim, rotate, stack, natural, style, ...rest }) => {
  const transform = useMemo(
    () => (natural ? `rotate(${new Rand(JSON.stringify(tile)).next() * 5 - 2.5}deg)` : ''),
    [natural, tile]
  )

  const commonStyle: CSSProperties = {
    ...style,
    transform,
    userSelect: 'none',
    filter: dim ? 'brightness(0.5)' : '',
  }

  return (
    <img
      {...rest}
      src={`./tiles/${convertTileToCode(tile)}.png`}
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
                commonStyle?.transform +
                ` translateY(-${size}vmin) rotate(90deg)` +
                (stack ? ` translateX(calc(-${size}vmin * 3/7))` : ''),
            }
          : { ...commonStyle, width: `${size}vmin`, minHeight: `calc(${size}vmin * 10/7)` }
      }
    />
  )
}

export default MahgenElement
