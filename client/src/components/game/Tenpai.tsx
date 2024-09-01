import { FC } from 'react'
import { Paper, Stack, Typography } from '@mui/material'
import TileWithCount from './TileWithCount'
import { compareSimpleTile } from '../../utils/tile'

import type { Tenpai } from '../../../../server/src/types/tenpai'

interface TenpaiProps {
  tenpaiList: Tenpai[]
  current?: boolean
}

const Tenpai: FC<TenpaiProps> = ({ tenpaiList, current }) => {
  return (
    <Paper
      sx={{
        position: 'absolute',
        bottom: current ? '10vmin' : '28vmin',
        left: '8vmin',
        padding: '1vmin',
      }}
    >
      <Typography variant="h6" align="center">
        {current ? 'Current' : 'This tile'}
      </Typography>
      <Stack direction="row" gap="1vmin">
        {tenpaiList
          .sort((a, b) => compareSimpleTile(a.agariTile, b.agariTile))
          .map((tenpai) => (
            <Stack direction="column" gap="1vmin" key={tenpai.agariTile.type + tenpai.agariTile.value}>
              <TileWithCount tile={tenpai.agariTile} size={5} />
              <Typography variant="h6" align="center">
                {tenpai.status}
              </Typography>
            </Stack>
          ))}
      </Stack>
    </Paper>
  )
}

export default Tenpai
