import { FC } from 'react'
import { Stack, Typography } from '@mui/material'
import SketchBox from '@ima/client/components/sketch-box'
import HaiCounter from '@ima/client/components/hai-counter'
import { getTenpaiStatusText } from '@ima/client/utils/game'
import { compareSimpleTile } from '@ima/client/utils/tile'

import type { Tenpai } from '@ima/server/types/tenpai'

interface TenpaiTilesProps {
  list: Tenpai[]
  current?: boolean
  unboxed?: boolean
}

const TenpaiTiles: FC<TenpaiTilesProps> = ({ list, current, unboxed }) => {
  const content = (
    <Stack direction="row" gap="1vmin">
      {[...list]
        .sort((a, b) => compareSimpleTile(a.agariTile, b.agariTile))
        .map((tenpai) => (
          <Stack direction="column" gap="0.25vmin" key={[tenpai.agariTile.type, tenpai.agariTile.value].join()}>
            <HaiCounter tile={tenpai.agariTile} size={3} />
            <Typography fontSize="2vmin" align="left">
              {getTenpaiStatusText(tenpai)}
            </Typography>
          </Stack>
        ))}
    </Stack>
  )

  if (unboxed) {
    return content
  }

  return (
    <SketchBox
      style={{
        position: 'absolute',
        bottom: current ? '11.5vmin' : '26vmin',
        left: '2vmin',
        padding: '1vmin 2vmin',
        opacity: 0.5,
        backgroundColor: '#fff',
      }}
    >
      <Typography fontSize="2.5vmin" fontWeight="bold">
        {current ? '현재' : ''}
      </Typography>
      {content}
    </SketchBox>
  )
}

export default TenpaiTiles
