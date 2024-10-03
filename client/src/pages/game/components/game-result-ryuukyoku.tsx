import { FC } from 'react'
import { Stack, Typography } from '@mui/material'
import SketchBox from '@ima/client/components/sketch-box'
import UserHandle from '@ima/client/components/user-handle'
import HandCard from '@ima/client/pages/game/components/hand-card'
import TenpaiTiles from '@ima/client/pages/game/components/tenpai-tiles'
import type { PlayerType, Room, RyuukyokuScoreboard, RyuukyokuType } from '@ima/server/types/game'

const ryuukyokuMap: Record<RyuukyokuType, string> = {
  ryuukyoku: '황패유국',
  suukaikan: '사깡유국',
}

interface GameResultRyuukyokuProps {
  room: Room
  scoreboard: RyuukyokuScoreboard
  me: PlayerType
}

const GameResultRyuukyoku: FC<GameResultRyuukyokuProps> = ({ room, scoreboard, me }) => {
  return (
    <>
      <Typography fontSize="6vmin">{ryuukyokuMap[scoreboard.ryuukyokuType]}</Typography>
      <Stack direction="column" gap="1vmin" flex={1}>
        {scoreboard.ryuukyokuType === 'ryuukyoku' &&
          [...scoreboard.tenpai]
            .sort((a, b) => {
              if (a === me) return 1
              if (b === me) return -1
              return 0
            })
            .map((player) => {
              const user = room[`${player}User`]
              const hand = scoreboard[`${player}Hand`]
              return (
                <Stack key={player} direction="column">
                  <SketchBox style={{ backgroundColor: '#cadf9f' }}>
                    <Stack direction="column" gap="1vmin" padding="1vmin">
                      {hand && (
                        <Stack direction="row" gap="1vmin" alignItems="flex-start">
                          {user && <UserHandle user={user} fontSize={3} />}
                          <Typography fontSize="3vmin">텐파이 - </Typography>
                          <TenpaiTiles list={hand.tenpai} unboxed />
                        </Stack>
                      )}
                      {hand && <HandCard hand={hand} />}
                    </Stack>
                  </SketchBox>
                </Stack>
              )
            })}
      </Stack>
    </>
  )
}

export default GameResultRyuukyoku
