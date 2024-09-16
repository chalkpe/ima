import { FC } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { getWindName } from '@ima/client/utils/game'
import type { GameState, PlayerType } from '@ima/server/types/game'

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
        backgroundSize: 'cover',
        backgroundImage: `url(/center.jpg)`,
      }}
    >
      <Box
        position="absolute"
        {...(state.turn === me ? { bottom: '2.2vmin', right: '2.2vmin' } : { top: '2.2vmin', left: '2.2vmin' })}
        width="3.5vmin"
        height="3.5vmin"
        display="flex"
        bgcolor="yellow"
        borderRadius="50%"
      />

      <Box position="relative" width="100%" height="100%">
        <Box
          position="absolute"
          top="calc(50% - 2.5vmin)"
          left="2.75vmin"
          right="calc(50% + 0.9vmin)"
          bottom="calc(50% - 2.5vmin)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="2.25vmin" fontWeight="bold">
            {getWindName(state.round.wind)}
            {state.round.kyoku}국 {state.round.honba}본장
          </Typography>
        </Box>
        <Box
          position="absolute"
          top="calc(50% - 2.5vmin)"
          left="calc(50% + 0.9vmin)"
          right="2.75vmin"
          bottom="calc(50% - 2.5vmin)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="3vmin" fontWeight="bold">
            {state.wall.tiles.length}/40
          </Typography>
        </Box>

        <Box
          position="absolute"
          top="1.55vmin"
          right="2.75vmin"
          width="4vmin"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          sx={{ transform: 'rotate(180deg)' }}
        >
          <Typography fontSize="2.75vmin" fontWeight="bold">
            {getWindName(state[op].wind)}
          </Typography>
        </Box>
        <Box
          position="absolute"
          top="3.5vmin"
          left="0"
          right="0"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          sx={{ transform: 'rotate(180deg)' }}
        >
          <Typography fontSize="2vmin" fontWeight="bold">
            {state[op].score}점
          </Typography>
        </Box>

        <Box
          position="absolute"
          bottom="1.55vmin"
          left="2.75vmin"
          width="4vmin"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="2.75vmin" fontWeight="bold">
            {getWindName(state[me].wind)}
          </Typography>
        </Box>
        <Box
          position="absolute"
          display="flex"
          bottom="3.5vmin"
          left="0"
          right="0"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="2vmin" fontWeight="bold">
            {state[me].score}점
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default Center
