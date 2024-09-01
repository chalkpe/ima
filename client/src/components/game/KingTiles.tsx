import { FC } from 'react'
import { Box, Stack } from '@mui/material'
import Mahgen from './Mahgen'
import { convertTileToCode } from '../../utils/tile'

import type { Wall } from '../../../../server/src/types/game'
import type { Tile } from '../../../../server/src/types/tile'

interface KingTilesProps {
  wall: Wall
}

const KingTiles: FC<KingTilesProps> = ({ wall }) => {
  const lowerTiles = wall.kingTiles.filter((_, index) => index % 2 === 0)
  const upperTiles = wall.kingTiles.filter((_, index) => index % 2 === 1)

  const supplementTiles = [
    ...Array(4 - wall.supplementTiles.length).fill(null),
    ...wall.supplementTiles,
  ] as (Tile | null)[]
  const lowerSupplementTiles = supplementTiles.filter((_, index) => index % 2 === 0)
  const upperSupplementTiles = supplementTiles.filter((_, index) => index % 2 === 1)

  return (
    <>
      <Stack
        direction="row"
        position="absolute"
        left="2.5vmin"
        top="30vmin"
        sx={{ transformOrigin: 'bottom left', transform: 'rotate(90deg)' }}
      >
        {lowerTiles.map((tile) => (
          <Mahgen key={tile.index} size={3.5} sequence={convertTileToCode(tile)} />
        ))}
      </Stack>
      <Stack
        direction="row"
        position="absolute"
        left="2vmin"
        top="30vmin"
        sx={{ transformOrigin: 'bottom left', transform: 'rotate(90deg)' }}
      >
        {upperTiles.map((tile) => (
          <Mahgen key={tile.index} size={3.5} sequence={convertTileToCode(tile)} />
        ))}
      </Stack>
      <Stack
        direction="row"
        position="absolute"
        left="2.5vmin"
        top="23vmin"
        sx={{ transformOrigin: 'bottom left', transform: 'rotate(90deg)' }}
      >
        {upperSupplementTiles.map((tile, index) =>
          tile !== null ? (
            <Mahgen key={tile.index} size={3.5} sequence={convertTileToCode(tile)} />
          ) : (
            <Box key={index} width="3.5vmin" />
          )
        )}
      </Stack>
      <Stack
        direction="row"
        position="absolute"
        left="2vmin"
        top="23vmin"
        sx={{ transformOrigin: 'bottom left', transform: 'rotate(90deg)' }}
      >
        {lowerSupplementTiles.map((tile, index) =>
          tile !== null ? (
            <Mahgen key={tile.index} size={3.5} sequence={convertTileToCode(tile)} />
          ) : (
            <Box key={index} width="3.5vmin" />
          )
        )}
      </Stack>
    </>
  )
}

export default KingTiles
