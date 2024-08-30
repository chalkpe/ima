import { FC } from 'react'
import { Paper } from '@mui/material'
import type { GameState, PlayerType } from '../../../../server/src/db'

interface CenterProps {
  state: GameState
  me: PlayerType
}

const Center: FC<CenterProps> = ({ state, me }) => {

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: '40vmin',
        left: '32.5vmin',
        width: '35vmin',
        height: '20vmin',
        backgroundColor: state.turn === me ? 'green' : 'red',
      }}
    >
      {state.wall.tiles.length}
      
    </Paper>
  )
}

export default Center
