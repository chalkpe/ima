import { FC } from 'react'
import { trpc } from '@ima/client/utils/trpc'
import { skipToken } from '@tanstack/react-query'
import { Stack, Typography } from '@mui/material'
import Mahgen from '@ima/client/components/tile/Mahgen'
import type { SimpleTile } from '@ima/server/types/tile'

interface TileWithCountProps {
  tile: SimpleTile
  size: number
}

const TileWithCount: FC<TileWithCountProps> = ({ tile, size }) => {
  const { type, value } = tile
  const { data } = trpc.game.getRemainingTileCount.useQuery(type === 'back' ? skipToken : { type, value })

  return (
    <Stack direction="row">
      <Mahgen size={size} tile={tile} />
      <Typography fontSize={`${size * 0.75}vmin`} align="center">
        &nbsp;x{data}
      </Typography>
    </Stack>
  )
}

export default TileWithCount
