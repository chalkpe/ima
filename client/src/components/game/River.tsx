import { FC } from 'react'
import Mahgen from '@ima/client/components/tile/Mahgen'
import { Box } from '@mui/material'
import { chunk } from '@ima/client/utils/tile'

import type { RiverTile } from '@ima/server/types/game'

interface RiverProps {
  river: RiverTile[]
  me?: boolean
}

const River: FC<RiverProps> = ({ river, me }) => {
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
      {chunk(river, 6).map((line, index) => (
        <Box key={index} sx={{ display: 'flex', flexFlow: 'row', gap: '0.1vmin' }}>
          {line.map((riverTile) => (
            <Mahgen
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

export default River
