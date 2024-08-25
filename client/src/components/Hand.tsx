import { FC, useMemo } from 'react'
import type { Hand } from '../../../server/src/db'
import { convertTileToCode, sortTiles } from '../utils/tile'
import Mahgen from './Mahgen'

interface HandProps {
  hand: Hand
}

const Hand: FC<HandProps> = ({ hand }) => {
  const closed = useMemo(() => sortTiles(hand.closed), [hand.closed])

  return (
    <div>
      {closed.map((tile, index) => (
        <Mahgen key={tile.type + tile.value + index} sequence={convertTileToCode(tile)} />
      ))}
    </div>
  )
}

export default Hand
