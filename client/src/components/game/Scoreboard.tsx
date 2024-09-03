import { FC } from 'react'
import { Button, Paper, Stack, Typography } from '@mui/material'
import type { Room } from '../../../../server/src/types/game'
import Mahgen from './Mahgen'
import { compareTile, convertTileToCode } from '../../utils/tile'
import { trpc } from '../../utils/trpc'

interface ScoreboardProps {
  data: Room
}

const Scoreboard: FC<ScoreboardProps> = ({ data }) => {
  const { mutate: confirm } = trpc.game.confirmScoreboard.useMutation()

  if (!data.state.scoreboard) return null
  const scoreboard = data.state.scoreboard

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
        유국
        <ul>
          {scoreboard.tenpai.map((player) => (
            <li key={player}>{player} - 텐파이</li>
          ))}
        </ul>
        <Button variant="contained" color="primary" onClick={() => confirm()}>
          확인
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

      <Stack direction="row" gap="1vmin">
        <Stack direction="row" gap={0}>
          {[...scoreboard.hand.closed].sort(compareTile).map((tile) => (
            <Mahgen key={tile.index} size={3} sequence={convertTileToCode(tile)} />
          ))}
        </Stack>
        <Stack direction="row" gap={0}>
          {scoreboard.hand.called
            .flatMap((set) => [...set.tiles].sort(compareTile))
            .map((tile) => (
              <Mahgen key={tile.index} size={3} sequence={convertTileToCode(tile)} />
            ))}
        </Stack>
        {scoreboard.hand.tsumo && <Mahgen size={3} sequence={convertTileToCode(scoreboard.hand.tsumo)} />}
      </Stack>

      <Stack direction="row" gap="1vmin">
        <Stack direction="row" gap="1vmin">
          <Typography fontSize="3vmin">도라</Typography>
          <Stack direction="row">
            {scoreboard.doraTiles.map((tile) => (
              <Mahgen key={tile.index} size={3} sequence={convertTileToCode(tile)} />
            ))}
          </Stack>
        </Stack>
        <Stack direction="row" gap="1vmin">
          <Typography fontSize="3vmin">뒷도라</Typography>
          <Stack direction="row">
            {scoreboard.uraDoraTiles.map((tile) => (
              <Mahgen key={tile.index} size={3} sequence={convertTileToCode(tile)} />
            ))}
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

      <Typography fontSize="5vmin">
        {scoreboard.yakuman > 0
          ? scoreboard.yakuman === 1
            ? '역만'
            : `${scoreboard.yakuman}배역만`
          : `${scoreboard.han}판`}
      </Typography>

      <Button variant="contained" color="primary" onClick={() => confirm()}>
        확인
      </Button>
    </Paper>
  )
}

export default Scoreboard
