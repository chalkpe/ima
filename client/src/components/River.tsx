import { FC } from 'react'
import type { RiverTile } from '../../../server/src/db'
import Mahgen from './Mahgen'
import { Box } from '@mui/material'
import { convertRiverTileToCode } from '../utils/tile'

interface RiverProps {
  river: RiverTile[]
  me?: boolean
}

const River: FC<RiverProps> = ({ river, me }) => {

  return (
    <Box sx={{ width: 420, transform: me ? undefined : 'rotate(180deg)', display: 'flex', flexFlow: 'row wrap', justifyContent: 'start' }}>
      {river.map(convertRiverTileToCode).map((sequence, index) => (
        <Mahgen key={sequence + index} sequence={sequence} riverMode />
      ))}
    </Box>
  )
}

export default River
