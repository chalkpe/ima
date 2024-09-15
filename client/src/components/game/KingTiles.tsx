import { FC } from 'react'
import { Box, Stack } from '@mui/material'
import Mahgen from '@ima/client/components/tile/Mahgen'

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

  const sx = { transformOrigin: 'bottom left', transform: 'rotate(90deg)' }

  return (
    <>
      <Stack direction="row" position="absolute" top="34vmin" left={`calc(${size * 0.2 + 2}vmin)`} sx={sx}>
        {lowerTiles.map((tile, index) =>
          tile !== null ? (
            <Mahgen key={tile.index} size={size} tile={tile} />
          ) : (
            <Box key={'lower' + index} width={`${size}vmin`} />
          )
        )}
      </Stack>
      <Stack direction="row" position="absolute" top="34vmin" left="2vmin" sx={sx}>
        {upperTiles.map((tile, index) =>
          tile !== null ? (
            <Mahgen key={tile.index} size={size} tile={tile} />
          ) : (
            <Box key={'upper' + index} width={`${size}vmin`} />
          )
        )}
      </Stack>
    </>
  )
}

export default KingTiles
