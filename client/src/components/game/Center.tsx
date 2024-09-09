import { FC } from 'react'
import { Box, Paper, Typography } from '@mui/material'

import type { GameState, PlayerType } from '@ima/server/types/game'
import { getWindName } from '@ima/client/utils/game'

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
      <Box position="relative" width="100%" height="100%">
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="4vmin">
            {getWindName(state.round.wind)}
            {state.round.kyoku}국 {state.round.honba}본장: {state.wall.tiles.length}
          </Typography>
        </Box>

        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          display="flex"
          justifyContent="center"
          sx={{ transform: 'rotate(180deg)' }}
        >
          <Typography fontSize="3vmin">
            {getWindName(state[op].wind)}: {state[op].score}점
          </Typography>
        </Box>

        <Box position="absolute" bottom="0" left="0" right="0" display="flex" justifyContent="center">
          <Typography fontSize="3vmin">
            {getWindName(state[me].wind)}: {state[me].score}점
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default Center
