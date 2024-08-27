import { FC } from 'react'
import type { GameState } from '../../../../server/src/db'
import { Paper } from '@mui/material'

interface CenterProps {
  state: GameState
}

const Center: FC<CenterProps> = ({ state }) => {
  return (
    <Paper
      sx={{
        position: 'absolute',
        top: '40vmin',
        left: '32.5vmin',
        width: '35vmin',
        height: '20vmin',
      }}
    >
      {state.wall.tiles.length}
    </Paper>
  )
}

export default Center
