import { FC } from 'react'
import type { Tile } from '../../../../server/src/db'
import Mahgen from './Mahgen'
import { convertTileToCode } from '../../utils/tile'
import { Box } from '@mui/material'

interface WallProps {
  tiles: Tile[]
}

const Wall: FC<WallProps> = ({ tiles }) => {
  return (
    <>
      <Box
        position="absolute"
        top="8vmin"
        right="2.5vmin"
        sx={{
          transformOrigin: 'bottom right',
          transform: 'rotate(-90deg)',
        }}
      >
        {tiles
          .filter((_, index) => index % 2 === 0)
          .map((tile, index) => (
            <Mahgen key={tile.type + tile.value + index} size={3.5} sequence={convertTileToCode(tile)} />
          ))}
      </Box>
      <Box
        position="absolute"
        top="8vmin"
        right="2vmin"
        sx={{
          transformOrigin: 'bottom right',
          transform: 'rotate(-90deg)',
        }}
      >
        {tiles
          .filter((_, index) => index % 2 === 1)
          .map((tile, index) => (
            <Mahgen key={tile.type + tile.value + index} size={3.5} sequence={convertTileToCode(tile)} />
          ))}
      </Box>
    </>
  )
}

export default Wall
