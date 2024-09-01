import { FC } from 'react'
import type { Scoreboard } from '../../../../server/src/types/game'
import { Box } from '@mui/material'

interface ScoreboardProps {
  scoreboard?: Scoreboard
}

const Scoreboard: FC<ScoreboardProps> = ({ scoreboard }) => {
  return (
    <Box sx={{ position: 'absolute', left: '5vmin', top: '5vmin' }}>
      <span>서버에서 받은 데이터: {JSON.stringify(scoreboard)}</span>
    </Box>
  )
}

export default Scoreboard
