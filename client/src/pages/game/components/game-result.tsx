import { FC } from 'react'
import { Button, Paper } from '@mui/material'
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
    <Paper
      sx={{
        position: 'absolute',
        left: '15vmin',
        top: '15vmin',
        right: '15vmin',
        bottom: '15vmin',
        padding: '5vmin',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: '1vmin',
      }}
    >
      {scoreboard.type === 'agari' && <GameResultAgari room={room} scoreboard={scoreboard} />}
      {scoreboard.type === 'final' && <GameResultFinal room={room} scoreboard={scoreboard} />}
      {scoreboard.type === 'ryuukyoku' && <GameResultRyuukyoku room={room} scoreboard={scoreboard} />}
      <Button
        variant="contained"
        color="primary"
        onClick={() => confirm()}
        disabled={meConfirmed}
        sx={{ minWidth: '5vmin', fontSize: '3vmin', padding: '1vmin 2vmin', borderRadius: '1vmin' }}
      >
        {meConfirmed ? '대기 중...' : '확인'}
      </Button>
    </Paper>
  )
}

export default GameResult
