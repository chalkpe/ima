import { FC } from 'react'
import { Box, Stack } from '@mui/material'
import Hai from '@ima/client/components/hai'

import type { Tile } from '@ima/server/types/tile'
import type { Wall } from '@ima/server/types/game'

interface WallTilesProps {
  wall: Wall
}

const WallTiles: FC<WallTilesProps> = ({ wall }) => {
  if (wall.tiles.length === 0) return null

  const firstIndex = wall.tiles[0].index
  const lastIndex = wall.tiles[wall.tiles.length - 1].index

  const tiles = [
    ...Array(firstIndex - wall.firstTileIndex).fill(null),
    ...wall.tiles,
    ...Array(wall.lastTileIndex - lastIndex).fill(null),
  ] as (Tile | null)[]

  const lowerTiles = tiles.filter((_, index) => index % 2 === 1)
  const upperTiles = tiles.filter((_, index) => index % 2 === 0)

  const index = upperTiles.findIndex((tile) => tile !== null && tile.index === lastIndex)
  if (lastIndex !== -1 && lowerTiles[index] === null) {
    ;[upperTiles[index], lowerTiles[index]] = [lowerTiles[index], upperTiles[index]]
  }

  return (
    <>
      <Stack direction="column-reverse" position="absolute" top="9vmin" right="2.5vmin">
        {lowerTiles.map((tile, index) =>
          tile !== null ? (
            <Hai key={tile.index} size={3.5} tile={tile} rotated animate />
          ) : (
            <Box key={['lower', index].join()} height="3.5vmin" />
          )
        )}
      </Stack>
      <Stack direction="column-reverse" position="absolute" top="9vmin" right="2vmin">
        {upperTiles.map((tile, index) =>
          tile !== null ? (
            <Hai key={tile.index} size={3.5} tile={tile} rotated animate />
          ) : (
            <Box key={['upper', index].join()} height="3.5vmin" />
          )
        )}
      </Stack>
    </>
  )
}

export default WallTiles
