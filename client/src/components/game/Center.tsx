import { FC } from 'react'
import { Paper } from '@mui/material'

import type { GameState, PlayerType } from '../../../../server/src/types/game'
import { getWindName } from '../../utils/game'

interface CenterProps {
  state: GameState
  me: PlayerType
}

const Center: FC<CenterProps> = ({ state, me }) => {
  const op = me === 'host' ? 'guest' : 'host'
  return (
    <Paper
      sx={{
        position: 'absolute',
        top: '40vmin',
        left: '32.5vmin',
        width: '35vmin',
        height: '20vmin',
        backgroundColor: state.turn === me ? 'green' : 'gray',
      }}
    >
      {getWindName(state.round.wind)}{state.round.kyoku}국 {state.round.honba}본장 <br />
      tiles left: {state.wall.tiles.length} <br />
      op: {getWindName(state[op].wind)}, {state[op].score}점 <br />
      me: {getWindName(state[me].wind)}, {state[me].score}점
    </Paper>
  )
}

export default Center
