import { FC } from 'react'
import Hai from '@ima/client/components/hai'
import { Box } from '@mui/material'
import { chunk } from '@ima/client/utils/tile'

import type { RiverTile } from '@ima/server/types/game'

interface RiverTilesProps {
  river: RiverTile[]
  me?: boolean
}

const RiverTiles: FC<RiverTilesProps> = ({ river, me }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: me ? '32.5vmin' : '67.5vmin',
        top: me ? '60.25vmin' : '39.75vmin',
        transformOrigin: 'top left',
        transform: me ? undefined : 'rotate(180deg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        gap: '0.2vmin',
      }}
    >
      {chunk(river, 6).map((line) => (
        <Box key={line.map((t) => t.tile.index).join()} sx={{ display: 'flex', flexFlow: 'row', gap: '0.1vmin' }}>
          {line.map((riverTile) => (
            <Hai
              key={riverTile.tile.index}
              size={5}
              natural
              rotate={riverTile.isRiichi}
              dim={riverTile.isTsumogiri}
              tile={riverTile.tile}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default RiverTiles
