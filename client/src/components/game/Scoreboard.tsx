import { FC } from 'react'
import { Button, Paper, Stack, Typography } from '@mui/material'
import Mahgen from '@ima/client/components/tile/Mahgen'
import { compareTile, convertTileToCode } from '@ima/client/utils/tile'
import { trpc } from '@ima/client/utils/trpc'
import type { PlayerType, Room, RyuukyokuType } from '@ima/server/types/game'
import TileSet from '@ima/client/components/tile/TileSet'

const ryuukyokuMap: Record<RyuukyokuType, string> = {
  ryuukyoku: '황패유국',
  suukaikan: '사깡유국',
}

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
        }}
      >
        <Typography fontSize="5vmin">최종 점수</Typography>
        <ul>
          <li>
            <Typography fontSize="3vmin">
              {data.host} - {scoreboard.hostScore.toLocaleString()}점
            </Typography>
          </li>
          <li>
            <Typography fontSize="3vmin">
              {data.guest} - {scoreboard.guestScore.toLocaleString()}점
            </Typography>
          </li>
        </ul>
        <Button variant="contained" color="primary" onClick={() => confirm()} disabled={meConfirmed}>
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
        }}
      >
        <Typography fontSize="7vmin">{ryuukyokuMap[scoreboard.ryuukyokuType]}</Typography>
        <ul>
          {scoreboard.tenpai.map((player) => (
            <li key={player}>
              <Typography fontSize="2vmin">{data[player]} - 텐파이</Typography>
            </li>
          ))}
        </ul>
        <Button variant="contained" color="primary" onClick={() => confirm()} disabled={meConfirmed}>
          {meConfirmed ? '대기 중...' : '확인'}
        </Button>
      </Paper>
    )
  }

  return (
    <Paper
      sx={{
        position: 'absolute',
        left: '15vmin',
        top: '15vmin',
        right: '15vmin',
        bottom: '15vmin',
        padding: '5vmin',
      }}
    >
      <Typography fontSize="7vmin">
        {data[scoreboard.winner]} {scoreboard.agariType === 'tsumo' ? '쯔모' : '론'}
      </Typography>

      <Stack direction="column" gap="2vmin">
        <Stack direction="row" gap="1vmin">
          <Stack direction="row" gap={0}>
            {[...scoreboard.hand.closed].sort(compareTile).map((tile) => (
              <Mahgen key={tile.index} size={3} tile={tile} />
            ))}
          </Stack>
          <Stack direction="row" gap="0.5vmin">
            {scoreboard.hand.called.map((tileSet) => (
              <TileSet
                key={tileSet.type + tileSet.jun + tileSet.tiles.map(convertTileToCode).join('')}
                tileSet={tileSet}
                size={3}
                rotate={false}
                stack={false}
              />
            ))}
          </Stack>
          {scoreboard.hand.tsumo && <Mahgen size={3} tile={scoreboard.hand.tsumo} />}
        </Stack>

        <Stack direction="row" gap="1vmin">
          <Stack direction="row" gap="1vmin">
            <Typography fontSize="3vmin">도라</Typography>
            <Stack direction="row">
              {scoreboard.doraTiles.map((tile) => (
                <Mahgen key={tile.index} size={3} tile={tile} />
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" gap="1vmin">
            <Typography fontSize="3vmin">뒷도라</Typography>
            <Stack direction="row">
              {scoreboard.uraDoraTiles.map((tile) => (
                <Mahgen key={tile.index} size={3} tile={tile} />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      <ul>
        {scoreboard.yaku.map((yaku) => (
          <li key={yaku.name}>
            <Typography fontSize="2vmin">
              {yaku.name} - {yaku.han}판
            </Typography>
          </li>
        ))}
      </ul>

      <Stack direction="row" gap="2vmin">
        <Typography fontSize="5vmin">
          {scoreboard.yakuman > 0
            ? scoreboard.yakuman === 1
              ? '역만'
              : `${scoreboard.yakuman}배역만`
            : `${scoreboard.han}판`}
        </Typography>
        <Typography fontSize="5vmin">{scoreboard.score}점</Typography>
      </Stack>

      <Button variant="contained" color="primary" onClick={() => confirm()} disabled={meConfirmed}>
        {meConfirmed ? '대기 중...' : '확인'}
      </Button>
    </Paper>
  )
}

export default Scoreboard
