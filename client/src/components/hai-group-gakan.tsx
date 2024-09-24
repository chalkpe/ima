import { FC } from 'react'
import type { TileSet } from '@ima/server/types/game'
import { Stack } from '@mui/material'
import Hai from '@ima/client/components/hai'

interface HaiGroupGakanProps {
  set: TileSet
  size: number
  flip?: boolean
  animate?: boolean
  rotate?: boolean
  stack?: boolean
}

const HaiGroupGakan: FC<HaiGroupGakanProps> = ({ set, size, flip, animate, rotate, stack }) => {
  return (
    <>
      <Hai size={size} flip={flip} animate={animate} tile={set.tiles[1]} />
      {stack ? (
        <Stack direction="column">
          <Hai size={size} animate={animate} rotate={rotate} stack tile={set.tiles[3]} />
          <Hai size={size} animate={animate} rotate={rotate} tile={set.tiles[0]} />
        </Stack>
      ) : (
        <>
          <Hai size={size} flip={flip} animate={animate} rotate={rotate} tile={set.tiles[0]} />
          <Hai size={size} flip={flip} animate={animate} rotate={rotate} tile={set.tiles[3]} />
        </>
      )}
      <Hai size={size} flip={flip} animate={animate} tile={set.tiles[2]} />
    </>
  )
}

export default HaiGroupGakan
