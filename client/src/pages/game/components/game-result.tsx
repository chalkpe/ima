import { FC } from 'react'
import { Stack, Typography, useTheme } from '@mui/material'
import SketchBox from '@ima/client/components/sketch-box'
import SketchButton from '@ima/client/components/sketch-button'
import { trpc } from '@ima/client/utils/trpc'
import GameResultAgari from '@ima/client/pages/game/components/game-result-agari'
import GameResultFinal from '@ima/client/pages/game/components/game-result-final'
import GameResultRyuukyoku from '@ima/client/pages/game/components/game-result-ryuukyoku'
import type { PlayerType, Room } from '@ima/server/types/game'

interface GameResultProps {
  room: Room
  me: PlayerType
}

const GameResult: FC<GameResultProps> = ({ room, me }) => {
  const theme = useTheme()
  const { mutate: confirm } = trpc.game.confirmScoreboard.useMutation()

  if (!room.state.scoreboard) return null
  const scoreboard = room.state.scoreboard
  const meConfirmed = me === 'host' ? scoreboard.hostConfirmed : scoreboard.guestConfirmed

  return (
    <SketchBox
      style={{
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        left: '15vmin',
        top: '15vmin',
        right: '15vmin',
        bottom: '15vmin',
        padding: '5vmin',
      }}
    >
      <Stack direction="column" alignItems="start" gap="1vmin" height="60vmin">
        {scoreboard.type === 'agari' && <GameResultAgari room={room} scoreboard={scoreboard} />}
        {scoreboard.type === 'final' && <GameResultFinal room={room} scoreboard={scoreboard} />}
        {scoreboard.type === 'ryuukyoku' && <GameResultRyuukyoku room={room} scoreboard={scoreboard} me={me} />}
        <Stack alignSelf="flex-end">
          <SketchButton loading={meConfirmed} onClick={() => confirm()}>
            <Typography fontSize="3vmin" style={{ padding: '1vmin' }}>
              {meConfirmed ? '대기 중...' : '확인'}
            </Typography>
          </SketchButton>
        </Stack>
      </Stack>
    </SketchBox>
  )
}

export default GameResult
