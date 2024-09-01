import { FC } from 'react'
import type { SimpleTile } from '../../../../server/src/types/tile'
import { trpc } from '../../utils/trpc'
import { skipToken } from '@tanstack/react-query'
import { Stack, Typography } from '@mui/material'
import Mahgen from './Mahgen'
import { convertTileToCode } from '../../utils/tile'

interface TileWithCountProps {
  tile: SimpleTile
  size: number
}

const TileWithCount: FC<TileWithCountProps> = ({ tile, size }) => {
  const { type, value } = tile
  const { data } = trpc.game.getRemainingTileCount.useQuery(type === 'back' ? skipToken : { type, value })

  return (
    <Stack direction="row">
      <Mahgen size={size} sequence={convertTileToCode(tile)} />
      <Typography variant="h6" align="center">
        &nbsp;x{data}
      </Typography>
    </Stack>
  )
}

export default TileWithCount
