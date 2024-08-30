import { FC } from 'react'
import type { RiverTile } from '../../../../server/src/db'
import Mahgen from './Mahgen'
import { Box } from '@mui/material'
import { chunk, convertRiverTileToCode } from '../../utils/tile'

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
        top: me ? '60vmin' : '40vmin',
        transformOrigin: 'top left',
        transform: me ? undefined : 'rotate(180deg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
      }}
    >
      {chunk(river, 6).map((line, index) => (
        <Box key={index} sx={{ display: 'flex', flexFlow: 'row' }}>
          {line.map((riverTile) => (
            <Mahgen
              key={riverTile.tile.type + riverTile.tile.value + riverTile.tile.index}
              size={5}
              riverMode
              sequence={convertRiverTileToCode(riverTile)}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default River
