import { FC } from 'react'
import { Paper, Stack, Typography } from '@mui/material'
import { convertTileToCode, sortTiles } from '../../utils/tile'
import Mahgen from './Mahgen'

import type { SimpleTile } from '../../../../server/src/types/tile'

interface TenpaiProps {
  tenpai: SimpleTile[]
  current?: boolean
}

const Tenpai: FC<TenpaiProps> = ({ tenpai, current }) => {
  if (tenpai.length === 0) return null

  return (
    <Paper
      sx={{
        position: 'absolute',
        bottom: current ? '10vmin' : '24vmin',
        left: '8vmin',
        padding: '1vmin',
      }}
    >
      <Typography variant="h6" align="center">
        {current ? 'Current' : 'This tile'}
      </Typography>
      <Stack direction="row" gap="1vmin">
        {sortTiles(tenpai).map((tile) => (
          <Mahgen key={tile.type + tile.value} size={5} sequence={convertTileToCode(tile)} />
        ))}
      </Stack>
    </Paper>
  )
}

export default Tenpai
