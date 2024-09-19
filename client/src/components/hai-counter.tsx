import { FC } from 'react'
import { trpc } from '@ima/client/utils/trpc'
import { skipToken } from '@tanstack/react-query'
import { Stack, Typography } from '@mui/material'
import Hai from '@ima/client/components/hai'
import type { SimpleTile } from '@ima/server/types/tile'

interface HaiCounterProps {
  tile: SimpleTile
  size: number
}

const HaiCounter: FC<HaiCounterProps> = ({ tile, size }) => {
  const { type, value } = tile
  const { data } = trpc.game.getRemainingTileCount.useQuery(type === 'back' ? skipToken : { type, value })

  return (
    <Stack direction="row">
      <Hai size={size} tile={tile} />
      <Typography fontSize={`${size * 0.75}vmin`} align="center">
        &nbsp;x{data}
      </Typography>
    </Stack>
  )
}

export default HaiCounter
