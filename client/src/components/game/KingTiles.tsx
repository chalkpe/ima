import { FC } from 'react'
import type { Tile } from '../../../../server/src/db'
import Mahgen from './Mahgen'
import { convertTileToCode } from '../../utils/tile'
import { Box } from '@mui/material'

interface KingTilesProps {
  tiles: Tile[]
}

const KingTiles: FC<KingTilesProps> = ({ tiles }) => {
  return (
    <>
      <Box
        position="absolute"
        left="3vmin"
        top="25vmin"
        sx={{
          transformOrigin: 'bottom left',
          transform: 'rotate(90deg)',
        }}
      >
        {tiles
          .filter((_, index) => index % 2 === 0)
          .map((tile, index) => (
            <Mahgen key={tile.type + tile.value + index} size={5} sequence={convertTileToCode(tile)} />
          ))}
      </Box>
      <Box
        position="absolute"
        left="2vmin"
        top="25vmin"
        sx={{
          transformOrigin: 'bottom left',
          transform: 'rotate(90deg)',
        }}
      >
        {tiles
          .filter((_, index) => index % 2 === 1)
          .map((tile, index) => (
            <Mahgen key={tile.type + tile.value + index} size={5} sequence={convertTileToCode(tile)} />
          ))}
      </Box>
    </>
  )
}

export default KingTiles
