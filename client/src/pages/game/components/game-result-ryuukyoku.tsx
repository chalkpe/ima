import { FC } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import UserHandle from '@ima/client/components/user-handle'
import type { Room, RyuukyokuScoreboard, RyuukyokuType } from '@ima/server/types/game'

const ryuukyokuMap: Record<RyuukyokuType, string> = {
  ryuukyoku: '황패유국',
  suukaikan: '사깡유국',
}

interface GameResultRyuukyokuProps {
  room: Room
  scoreboard: RyuukyokuScoreboard
}

const GameResultRyuukyoku: FC<GameResultRyuukyokuProps> = ({ room, scoreboard }) => {
  return (
    <>
      <Typography fontSize="6vmin">{ryuukyokuMap[scoreboard.ryuukyokuType]}</Typography>
      <Stack direction="column" gap="1vmin" flex={1}>
        {scoreboard.tenpai.map((player) => {
          const user = room[`${player}User`]
          return (
            <Box key={player} sx={{ backgroundColor: '#ccc', padding: '0 1vmin', borderRadius: '1vmin' }}>
              {user && <UserHandle {...user} fontSize={2} />}
              <Typography fontSize="2vmin">텐파이</Typography>
            </Box>
          )
        })}
      </Stack>
    </>
  )
}

export default GameResultRyuukyoku
