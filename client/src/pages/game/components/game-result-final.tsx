import { FC } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import UserHandle from '@ima/client/components/user-handle'
import type { FinalScoreboard, Room } from '@ima/server/types/game'

const players = ['host', 'guest'] as const

interface GameResultFinalProps {
  room: Room
  scoreboard: FinalScoreboard
}

const GameResultFinal: FC<GameResultFinalProps> = ({ room, scoreboard }) => {
  return (
    <>
      <Typography fontSize="6vmin">최종 점수</Typography>
      <Stack direction="column" gap="1vmin" flex={1}>
        {[...players]
          .sort((a, b) => scoreboard[`${b}Score`] - scoreboard[`${a}Score`])
          .map((player) => {
            const user = room[`${player}User`]
            return (
              <Box key={player} sx={{ backgroundColor: '#ccc', padding: '0 1vmin', borderRadius: '1vmin' }}>
                <Typography fontSize="3vmin">
                  {user && <UserHandle {...user} fontSize={3} />}
                  {scoreboard[`${player}Score`].toLocaleString()}점
                </Typography>
              </Box>
            )
          })}
      </Stack>
    </>
  )
}

export default GameResultFinal
