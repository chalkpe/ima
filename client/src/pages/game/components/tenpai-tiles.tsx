import { FC } from 'react'
import { WiredCard } from 'react-wired-elements'
import { Stack, Typography } from '@mui/material'
import HaiCounter from '@ima/client/components/hai-counter'
import { tenpaiStatusText } from '@ima/client/utils/game'
import { compareSimpleTile } from '@ima/client/utils/tile'

import type { Tenpai } from '@ima/server/types/tenpai'

interface TenpaiTilesProps {
  list: Tenpai[]
  current?: boolean
}

const TenpaiTiles: FC<TenpaiTilesProps> = ({ list, current }) => {
  return (
    <WiredCard
      elevation={1}
      style={{
        position: 'absolute',
        bottom: current ? '11.5vmin' : '26vmin',
        left: '2vmin',
        padding: '1vmin 2vmin',
        opacity: 0.5,
        backgroundColor: '#fff',
        userSelect: 'none',
      }}
    >
      <Typography fontSize="2.5vmin" fontWeight="bold">
        {current ? '현재' : ''}
      </Typography>
      <Stack direction="row" gap="1vmin">
        {[...list]
          .sort((a, b) => compareSimpleTile(a.agariTile, b.agariTile))
          .map((tenpai) => (
            <Stack direction="column" gap="0.25vmin" key={[tenpai.agariTile.type, tenpai.agariTile.value].join()}>
              <HaiCounter tile={tenpai.agariTile} size={3} />
              <Typography fontSize="2vmin" align="left">
                {tenpai.status === 'tenpai' ? `${tenpai.han}판` : tenpaiStatusText[tenpai.status]}
              </Typography>
            </Stack>
          ))}
      </Stack>
    </WiredCard>
  )
}

export default TenpaiTiles
