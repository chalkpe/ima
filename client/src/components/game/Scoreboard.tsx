import { FC } from 'react'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import Mahgen from '@ima/client/components/tile/Mahgen'
import { compareTile, convertTileToCode } from '@ima/client/utils/tile'
import { trpc } from '@ima/client/utils/trpc'
import type { PlayerType, Room, RyuukyokuType } from '@ima/server/types/game'
import TileSet from '@ima/client/components/tile/TileSet'
import UserHandle from '@ima/client/components/user/UserHandle'

const ryuukyokuMap: Record<RyuukyokuType, string> = {
  ryuukyoku: '황패유국',
  suukaikan: '사깡유국',
}

const players = ['host', 'guest'] as const

interface ScoreboardProps {
  data: Room
  me: PlayerType
}

const Scoreboard: FC<ScoreboardProps> = ({ data, me }) => {
  const { mutate: confirm } = trpc.game.confirmScoreboard.useMutation()

  if (!data.state.scoreboard) return null

  const scoreboard = data.state.scoreboard
  const meConfirmed = me === 'host' ? scoreboard.hostConfirmed : scoreboard.guestConfirmed

  if (scoreboard.type === 'final') {
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
        <Typography fontSize="5vmin">최종 점수</Typography>
        <Stack direction="column" gap="1vmin" flex={1}>
          {[...players]
            .sort((a, b) => scoreboard[`${b}Score`] - scoreboard[`${a}Score`])
            .map((player) => {
              const user = data[`${player}User`]
              return (
                <Box key={player} sx={{ backgroundColor: '#ccc', padding: '0 1vmin', borderRadius: '1vmin' }}>
                  <Typography fontSize="3vmin">
                    {user && <UserHandle {...user} fontSize={3} />} - {scoreboard[`${player}Score`].toLocaleString()}점
                  </Typography>
                </Box>
              )
            })}
        </Stack>
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

  if (scoreboard.type === 'ryuukyoku') {
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
        <Typography fontSize="7vmin">{ryuukyokuMap[scoreboard.ryuukyokuType]}</Typography>
        <Stack direction="column" gap="1vmin" flex={1}>
          {scoreboard.tenpai.map((player) => {
            const user = data[`${player}User`]
            return (
              <Box key={player} sx={{ backgroundColor: '#ccc', padding: '0 1vmin', borderRadius: '1vmin' }}>
                <Typography fontSize="2vmin">{user && <UserHandle {...user} fontSize={2} />} - 텐파이</Typography>
              </Box>
            )
          })}
        </Stack>
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

  const winner = data[`${scoreboard.winner}User`]

  return (
    <Paper
      sx={{
        position: 'absolute',
        left: '15vmin',
        top: '15vmin',
        right: '15vmin',
        bottom: '15vmin',
        padding: '3vmin',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: '1vmin',
      }}
    >
      <Typography fontSize="6vmin" fontWeight="bold">
        {winner?.displayName} {scoreboard.agariType === 'tsumo' ? '쯔모' : '론'}
      </Typography>

      <Stack direction="column" gap="2vmin" padding="1.5vmin" borderRadius="1vmin" sx={{ backgroundColor: '#cadf9f' }}>
        <Stack direction="row" gap="1vmin">
          <Stack direction="row" gap={0}>
            {[...scoreboard.hand.closed].sort(compareTile).map((tile) => (
              <Mahgen key={tile.index} size={3.5} tile={tile} />
            ))}
          </Stack>
          <Stack direction="row" gap="0.5vmin">
            {scoreboard.hand.called.map((tileSet) => (
              <TileSet
                key={tileSet.type + tileSet.jun + tileSet.tiles.map(convertTileToCode).join('')}
                tileSet={tileSet}
                size={3.5}
                rotate={false}
                stack={false}
              />
            ))}
          </Stack>
          {scoreboard.hand.tsumo && <Mahgen size={3.5} tile={scoreboard.hand.tsumo} />}
        </Stack>

        <Stack direction="row" gap="1vmin">
          <Stack direction="row" gap="1vmin">
            <Typography fontSize="3vmin">도라</Typography>
            <Stack direction="row">
              {scoreboard.doraTiles.map((tile) => (
                <Mahgen key={tile.index} size={3.5} tile={tile} />
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" gap="1vmin">
            <Typography fontSize="3vmin">뒷도라</Typography>
            <Stack direction="row">
              {scoreboard.uraDoraTiles.map((tile) => (
                <Mahgen key={tile.index} size={3.5} tile={tile} />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap="1vmin">
        {scoreboard.yaku.map((yaku) => (
          <Stack
            key={yaku.name}
            direction="row"
            gap="1vmin"
            sx={{ backgroundColor: yaku.isYakuman ? '#fac12d' : '#ccc', padding: '0 1vmin', borderRadius: '1vmin' }}
          >
            <Typography fontSize="3vmin" fontWeight="bold">
              {yaku.name}
            </Typography>
            <Typography fontSize="3vmin">{yaku.han}판</Typography>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" gap="2vmin" flex="1">
        <Typography fontSize="5vmin" fontWeight="bold">
          {scoreboard.yakuman > 0
            ? scoreboard.yakuman === 1
              ? '역만'
              : `${scoreboard.yakuman}배역만`
            : `${scoreboard.han}판`}
        </Typography>
        <Typography fontSize="5vmin" fontWeight="bold">
          {scoreboard.score}점
        </Typography>
      </Stack>

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

export default Scoreboard
