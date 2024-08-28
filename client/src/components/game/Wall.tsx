import { FC } from 'react'
import type { Tile, Wall } from '../../../../server/src/db'
import Mahgen from './Mahgen'
import { convertTileToCode } from '../../utils/tile'
import { Box, Stack } from '@mui/material'

interface WallProps {
  wall: Wall
}

const Wall: FC<WallProps> = ({ wall }) => {
  if (wall.tiles.length === 0) return null

  const firstIndex = wall.tiles[0].index
  const lastIndex = wall.tiles[wall.tiles.length - 1].index

  const tiles = [
    ...Array(firstIndex).fill(null),
    ...wall.tiles,
    ...Array(wall.tilesCount - lastIndex - 1).fill(null),
  ] as (Tile | null)[]

  const lowerTiles = tiles.filter((_, index) => index % 2 === 1)
  const upperTiles = tiles.filter((_, index) => index % 2 === 0)

  const index = upperTiles.findIndex((tile) => tile !== null && tile.index === lastIndex)
  if (lastIndex !== -1 && lowerTiles[index] === null) {
    ;[upperTiles[index], lowerTiles[index]] = [lowerTiles[index], upperTiles[index]]
  }

  return (
    <>
      <Stack
        direction="row"
        position="absolute"
        top="8vmin"
        right="2.5vmin"
        sx={{ transformOrigin: 'bottom right', transform: 'rotate(-90deg)' }}
      >
        {lowerTiles.map((tile, index) =>
          tile !== null ? (
            <Mahgen key={tile.type + tile.value + index} size={3.5} sequence={convertTileToCode(tile)} />
          ) : (
            <Box width="3.5vmin" />
          )
        )}
      </Stack>
      <Stack
        direction="row"
        position="absolute"
        top="8vmin"
        right="2vmin"
        sx={{ transformOrigin: 'bottom right', transform: 'rotate(-90deg)' }}
      >
        {upperTiles.map((tile, index) =>
          tile !== null ? (
            <Mahgen key={tile.type + tile.value + index} size={3.5} sequence={convertTileToCode(tile)} />
          ) : (
            <Box width="3.5vmin" />
          )
        )}
      </Stack>
    </>
  )
}

export default Wall
