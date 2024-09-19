import { FC } from 'react'
import type { TileSet } from '@ima/server/types/game'
import { Stack } from '@mui/material'
import Hai from '@ima/client/components/hai'

interface HaiGroupGakanProps {
  set: TileSet
  size: number
  rotate?: boolean
  stack?: boolean
}

const HaiGroupGakan: FC<HaiGroupGakanProps> = ({ set, size, rotate, stack }) => {
  return (
    <>
      <Hai size={size} tile={set.tiles[1]} />
      {stack ? (
        <Stack direction="column">
          <Hai size={size} rotate={rotate} stack tile={set.tiles[3]} />
          <Hai size={size} rotate={rotate} tile={set.tiles[0]} />
        </Stack>
      ) : (
        <>
          <Hai size={size} rotate={rotate} tile={set.tiles[0]} />
          <Hai size={size} rotate={rotate} tile={set.tiles[3]} />
        </>
      )}
      <Hai size={size} tile={set.tiles[2]} />
    </>
  )
}

export default HaiGroupGakan
