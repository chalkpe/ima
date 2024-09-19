import { FC } from 'react'
import { WiredCard } from 'react-wired-elements'
import { Stack, Typography } from '@mui/material'
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
            <WiredCard key={player} elevation={1} style={{ padding: '1vmin 2vmin', backgroundColor: '#ccc' }}>
              {user && <UserHandle {...user} fontSize={3} />}
              <Typography fontSize="3vmin">텐파이</Typography>
            </WiredCard>
          )
        })}
      </Stack>
    </>
  )
}

export default GameResultRyuukyoku
