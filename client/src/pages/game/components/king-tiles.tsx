import { FC } from 'react'
import { Box, Stack } from '@mui/material'
import Hai from '@ima/client/components/hai'

import type { Wall } from '@ima/server/types/game'
import type { Tile } from '@ima/server/types/tile'

interface KingTilesProps {
  wall: Wall
  size?: number
}

const KingTiles: FC<KingTilesProps> = ({ wall, size = 4 }) => {
  const firstIndex = wall.kingTiles[0]?.index ?? -1
  const lastIndex = wall.supplementTiles[wall.supplementTiles.length - 1]?.index ?? -1

  const kingTiles =
    firstIndex !== -1
      ? ([
          ...Array(firstIndex - wall.firstKingTileIndex).fill(null),
          ...wall.kingTiles,
          ...wall.supplementTiles,
          ...Array(4 - wall.supplementTiles.length).fill(null),
        ] as (Tile | null)[])
      : []

  const lowerTiles = kingTiles.filter((_, index) => index % 2 === 1)
  const upperTiles = kingTiles.filter((_, index) => index % 2 === 0)

  const index = upperTiles.findIndex((tile) => tile !== null && tile.index === lastIndex)
  if (lastIndex !== -1 && lowerTiles[index] === null) {
    ;[upperTiles[index], lowerTiles[index]] = [lowerTiles[index], upperTiles[index]]
  }

  return (
    <>
      <Stack direction="column" position="absolute" top="34vmin" left={`calc(${size * 0.2 + 4}vmin)`}>
        {lowerTiles.map((tile, index) =>
          tile !== null ? (
            <Hai key={tile.index} size={size} tile={tile} rotated animate />
          ) : (
            <Box key={['lower', index].join()} height={`${size}vmin`} />
          )
        )}
      </Stack>
      <Stack direction="column" position="absolute" top="34vmin" left="4vmin">
        {upperTiles.map((tile, index) =>
          tile !== null ? (
            <Hai key={tile.index} size={size} tile={tile} rotated animate />
          ) : (
            <Box key={['upper', index].join()} height={`${size}vmin`} />
          )
        )}
      </Stack>
    </>
  )
}

export default KingTiles
