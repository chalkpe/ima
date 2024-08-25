import { FC } from 'react'
import type { Tile } from '../../../server/src/db'
import Mahgen from './Mahgen'
import { convertTileToCode } from '../utils/tile'

interface KingTilesProps {
  tiles: Tile[]
}

const KingTiles: FC<KingTilesProps> = ({ tiles }) => {
  return (
    <section>
      <div>
        {tiles
          .filter((_, index) => index % 2 === 1)
          .map((tile, index) => (
            <Mahgen key={tile.type + tile.value + index} sequence={convertTileToCode(tile)} />
          ))}
      </div>
      <div>
        {tiles
          .filter((_, index) => index % 2 === 0)
          .map((tile, index) => (
            <Mahgen key={tile.type + tile.value + index} sequence={convertTileToCode(tile)} />
          ))}
      </div>
    </section>
  )
}

export default KingTiles
