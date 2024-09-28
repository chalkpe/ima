import { CSSProperties, FC, useMemo } from 'react'
import { motion } from 'framer-motion'
import Rand from 'rand-seed'
import { convertTileToCode, getBackground } from '@ima/client/utils/tile'
import type { SimpleTile, Tile } from '@ima/server/types/tile'

interface HaiProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  size: number
  tile: Tile | SimpleTile
  dim?: boolean
  rotate?: boolean
  rotated?: boolean
  stack?: boolean
  natural?: boolean
  animate?: boolean
  flip?: boolean
  selected?: boolean
}

const Hai: FC<HaiProps> = ({
  size,
  tile,
  dim,
  rotate,
  rotated,
  stack,
  natural,
  animate,
  flip,
  selected,
  style,
  ...rest
}) => {
  const transform = useMemo(
    () => (natural ? `rotate(${new Rand(JSON.stringify(tile)).next() * 3 - 1.5}deg)` : ''),
    [natural, tile]
  )

  const commonStyle: CSSProperties = {
    ...style,
    display: 'flex',
    transform,
    userSelect: 'none',
    filter: dim ? 'brightness(0.5)' : '',
    backgroundImage: `url(./back/${getBackground(tile, selected)}.png)`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
  }

  const commonImageStyle: CSSProperties = {
    width: `${size}vmin`,
    minHeight: `calc(${size}vmin * 10/7)`,
  }

  const content = (
    <div
      {...rest}
      style={
        rotate
          ? {
              ...commonStyle,
              marginBottom: stack ? `calc(-${size}vmin * 6/7)` : '',
              marginRight: stack ? '' : `calc(${size}vmin * 3/7)`,
              transformOrigin: 'bottom left',
              transform:
                (commonStyle?.transform ?? '') +
                ` translateY(-${size}vmin) rotate(90deg)` +
                (stack ? ` translateX(calc(-${size}vmin * 3/7))` : ''),
            }
          : { ...commonStyle }
      }
    >
      {tile.type === 'back' ? (
        <div style={commonImageStyle} />
      ) : (
        <img alt={convertTileToCode(tile)} src={`./tiles/${convertTileToCode(tile)}.png`} style={commonImageStyle} />
      )}
    </div>
  )

  if (animate && 'index' in tile) {
    return (
      <motion.div
        layoutId={tile.index.toString()}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={rotated ? { rotate: 90, marginBottom: `calc(-${size}vmin * 3/7)` } : flip ? { rotate: 180 } : {}}
      >
        {content}
      </motion.div>
    )
  } else {
    return content
  }
}

export default Hai
