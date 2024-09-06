import { FC } from 'react'
import { Paper, Stack, Typography } from '@mui/material'
import TileWithCount from '@ima/client/components/tile/TileWithCount'
import { compareSimpleTile } from '@ima/client/utils/tile'

import type { Tenpai } from '@ima/server/types/tenpai'

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
        opacity: 0.5,
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
              <TileWithCount tile={tenpai.agariTile} size={3} />
              <Typography fontSize="2vmin" align="left">
                {statusText[tenpai.status]}
              </Typography>
              <Typography fontSize="2vmin" align="left">
                {tenpai.status === 'tenpai' ? ` ${tenpai.han}판` : ''}
              </Typography>
            </Stack>
          ))}
      </Stack>
    </Paper>
  )
}

export default Tenpai
