import { FC } from 'react'
import { WiredButton, WiredCard } from 'react-wired-elements'
import { Stack } from '@mui/material'
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
  const { mutate: confirm } = trpc.game.confirmScoreboard.useMutation()

  if (!room.state.scoreboard) return null
  const scoreboard = room.state.scoreboard
  const meConfirmed = me === 'host' ? scoreboard.hostConfirmed : scoreboard.guestConfirmed

  return (
    <WiredCard
      elevation={5}
      style={{
        backgroundColor: 'white',
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
        {scoreboard.type === 'ryuukyoku' && <GameResultRyuukyoku room={room} scoreboard={scoreboard} />}
        <WiredButton
          onClick={() => confirm()}
          disabled={meConfirmed}
          style={{ minWidth: '5vmin', fontSize: '3vmin', borderRadius: '1vmin', alignSelf: 'flex-end' }}
        >
          <div style={{ padding: '1vmin' }}>{meConfirmed ? '대기 중...' : '확인'}</div>
        </WiredButton>
      </Stack>
    </WiredCard>
  )
}

export default GameResult
