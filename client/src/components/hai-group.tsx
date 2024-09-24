import { FC } from 'react'
import { Stack } from '@mui/material'
import HaiGroupAnkan from '@ima/client/components/hai-group-ankan'
import HaiGroupGakan from '@ima/client/components/hai-group-gakan'
import HaiGroupDefault from '@ima/client/components/hai-group-default'
import type { TileSet } from '@ima/server/types/game'

const itemMap: Record<TileSet['type'], FC<HaiGroupProps>> = {
  ankan: HaiGroupAnkan,
  gakan: HaiGroupGakan,
  pon: HaiGroupDefault,
  chi: HaiGroupDefault,
  daiminkan: HaiGroupDefault,
}

interface HaiGroupProps {
  set: TileSet
  size: number
  flip?: boolean
  animate?: boolean
  rotate?: boolean
  stack?: boolean
}

const HaiGroup: FC<HaiGroupProps> = ({ set, size, flip, animate, rotate = true, stack = true }) => {
  const Item = itemMap[set.type]
  return (
    <Stack direction="row" gap={0} alignItems={flip ? 'start' : 'end'} justifyContent={flip ? 'start' : 'end'}>
      <Item set={set} size={size} flip={flip} animate={animate} rotate={rotate} stack={stack} />
    </Stack>
  )
}

export default HaiGroup
