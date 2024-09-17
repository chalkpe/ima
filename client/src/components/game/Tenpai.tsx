import { FC } from 'react'
import { Paper, Stack, Typography } from '@mui/material'
import TileWithCount from '@ima/client/components/tile/TileWithCount'
import { tenpaiStatusText } from '@ima/client/utils/game'
import { compareSimpleTile } from '@ima/client/utils/tile'

import type { Tenpai } from '@ima/server/types/tenpai'

interface TenpaiProps {
  tenpaiList: Tenpai[]
  current?: boolean
}

const Tenpai: FC<TenpaiProps> = ({ tenpaiList, current }) => {
  return (
    <Paper
      sx={{
        position: 'absolute',
        bottom: current ? '11.5vmin' : '26vmin',
        left: '2vmin',
        padding: '1vmin 2vmin',
        opacity: 0.5,
        userSelect: 'none',
      }}
    >
      <Typography fontSize="2.5vmin" fontWeight="bold">
        {current ? '현재' : ''}
      </Typography>
      <Stack direction="row" gap="1vmin">
        {[...tenpaiList]
          .sort((a, b) => compareSimpleTile(a.agariTile, b.agariTile))
          .map((tenpai) => (
            <Stack direction="column" gap="0.25vmin" key={tenpai.agariTile.type + tenpai.agariTile.value}>
              <TileWithCount tile={tenpai.agariTile} size={3} />
              <Typography fontSize="2vmin" align="left">
                {tenpai.status === 'tenpai' ? `${tenpai.han}판` : tenpaiStatusText[tenpai.status]}
              </Typography>
            </Stack>
          ))}
      </Stack>
    </Paper>
  )
}

export default Tenpai
