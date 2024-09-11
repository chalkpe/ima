import { FC } from 'react'
import { Box, Stack } from '@mui/material'
import Mahgen from '@ima/client/components/tile/Mahgen'

import type { Wall } from '@ima/server/types/game'
import type { Tile } from '@ima/server/types/tile'

interface KingTilesProps {
  wall: Wall
}

const KingTiles: FC<KingTilesProps> = ({ wall }) => {
  const firstIndex = wall.kingTiles[0].index
  const lastIndex = wall.supplementTiles[wall.supplementTiles.length - 1].index

  const kingTiles = [
    ...Array(firstIndex - wall.firstKingTileIndex).fill(null),
    ...wall.kingTiles,
    ...wall.supplementTiles,
    ...Array(4 - wall.supplementTiles.length).fill(null),
  ] as (Tile | null)[]

  const lowerTiles = kingTiles.filter((_, index) => index % 2 === 1)
  const upperTiles = kingTiles.filter((_, index) => index % 2 === 0)

  const index = upperTiles.findIndex((tile) => tile !== null && tile.index === lastIndex)
  if (lastIndex !== -1 && lowerTiles[index] === null) {
    ;[upperTiles[index], lowerTiles[index]] = [lowerTiles[index], upperTiles[index]]
  }

  const sx = { transformOrigin: 'bottom left', transform: 'rotate(90deg)' }

  return (
    <>
      <Stack direction="row" position="absolute" left="2.5vmin" top="30vmin" sx={sx}>
        {lowerTiles.map((tile, index) =>
          tile !== null ? (
            <Mahgen key={tile.index} size={3.5} tile={tile} />
          ) : (
            <Box key={'lower' + index} width="3.5vmin" />
          )
        )}
      </Stack>
      <Stack direction="row" position="absolute" left="2vmin" top="30vmin" sx={sx}>
        {upperTiles.map((tile, index) =>
          tile !== null ? (
            <Mahgen key={tile.index} size={3.5} tile={tile} />
          ) : (
            <Box key={'upper' + index} width="3.5vmin" />
          )
        )}
      </Stack>
    </>
  )
}

export default KingTiles
