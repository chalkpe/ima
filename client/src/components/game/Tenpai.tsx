import { FC } from 'react'
import { Paper, Stack, Typography } from '@mui/material'
import TileWithCount from './TileWithCount'
import { compareSimpleTile } from '../../utils/tile'

import type { Tenpai } from '../../../../server/src/types/tenpai'

const statusText: Record<Tenpai['status'], string> = {
  tenpai: '텐파이',
  furiten: '후리텐',
  muyaku: '역 없음',
}

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
      <Typography fontSize="2.5vmin" align="center">
        {current ? '현재' : ''}
      </Typography>
      <Stack direction="row" gap="1vmin">
        {tenpaiList
          .sort((a, b) => compareSimpleTile(a.agariTile, b.agariTile))
          .map((tenpai) => (
            <Stack direction="column" gap="1vmin" key={tenpai.agariTile.type + tenpai.agariTile.value}>
              <TileWithCount tile={tenpai.agariTile} size={5} />
              <Typography fontSize="2vmin" align="left">
                {statusText[tenpai.status]}
              </Typography>
            </Stack>
          ))}
      </Stack>
    </Paper>
  )
}

export default Tenpai
