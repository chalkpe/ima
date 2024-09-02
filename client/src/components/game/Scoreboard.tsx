import { FC } from 'react'
import { Paper, Stack, Typography } from '@mui/material'
import type { Room } from '../../../../server/src/types/game'
import Mahgen from './Mahgen'
import { convertTileToCode } from '../../utils/tile'

interface ScoreboardProps {
  data: Room
}

const Scoreboard: FC<ScoreboardProps> = ({ data }) => {
  if (!data.state.scoreboard) return null
  const scoreboard = data.state.scoreboard

  return (
    <Paper
      sx={{ position: 'absolute', left: '15vmin', top: '15vmin', right: '15vmin', bottom: '15vmin', padding: '5vmin' }}
    >
      {data[scoreboard.winner]} - {scoreboard.han}판 / {scoreboard.yakuman}배역만
      <Paper>
        <Typography fontSize="5vmin">도라</Typography>
        <Stack direction="row">
          {scoreboard.doraTiles.map((tile) => (
            <Mahgen key={tile.index} size={5} sequence={convertTileToCode(tile)} />
          ))}
        </Stack>
      </Paper>
      <Paper>
        <Typography fontSize="5vmin">뒷도라</Typography>
        <Stack direction="row">
          {scoreboard.uraDoraTiles.map((tile) => (
            <Mahgen key={tile.index} size={5} sequence={convertTileToCode(tile)} />
          ))}
        </Stack>
      </Paper>
      <ul>
        {scoreboard.yaku.map((yaku) => (
          <li key={yaku.name}>
            {yaku.name} - {yaku.han}판
          </li>
        ))}
      </ul>
    </Paper>
  )
}

export default Scoreboard
