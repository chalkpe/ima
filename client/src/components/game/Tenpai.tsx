import { FC } from 'react'
import type { SimpleTile } from '../../../../server/src/db'
import { Paper, Stack } from '@mui/material'
import { convertTileToCode, sortTiles } from '../../utils/tile'
import Mahgen from './Mahgen'

interface TenpaiProps {
  tenpai: SimpleTile[]
}

const Tenpai: FC<TenpaiProps> = ({ tenpai }) => {
  if (tenpai.length === 0) return null

  return (
    <Paper sx={{
      position: 'absolute',
      bottom: '10vmin',
      left: '50vmin',
      padding: '1vmin',
    }}>
      <Stack direction="row" gap="1vmin">
        {sortTiles(tenpai).map((tile) => (
          <Mahgen key={tile.type + tile.value} size={5} sequence={convertTileToCode(tile)} />
        ))}
      </Stack>
    </Paper>
  )
}

export default Tenpai
