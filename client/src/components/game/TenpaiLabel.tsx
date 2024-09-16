import { FC, useMemo } from 'react'
import { Paper, Typography } from '@mui/material'
import type { Tenpai } from '@ima/server/types/tenpai'
import { tenpaiStatusText } from '@ima/client/utils/game'

const states = {
  ready: { text: '역만 준비', color: '#fac12d', isYakuman: true },
  chance: { text: '역만 기회', color: '#ccc', isYakuman: true },
  tenpai: { text: tenpaiStatusText['tenpai'], color: undefined, isYakuman: false },
} as const

interface TenpaiLabelProps {
  list: Tenpai[]
}

const TenpaiLabel: FC<TenpaiLabelProps> = ({ list }) => {
  const state = useMemo(
    () =>
      list.every((t) => t.han >= 13)
        ? states.ready
        : list.some((t) => t.han >= 13)
          ? states.chance
          : list.some((t) => t.status === 'tenpai')
            ? states.tenpai
            : undefined,
    [list]
  )

  if (!state) return null
  return (
    <Paper
      sx={{
        opacity: state.isYakuman ? 0.75 : 0.5,
        position: 'absolute',
        left: '2vmin',
        bottom: '26vmin',
        padding: '1vmin',
        backgroundColor: state.color,
      }}
    >
      <Typography fontSize="2.5vmin" fontWeight={state.isYakuman ? 'bold' : undefined}>
        {state.text}
      </Typography>
    </Paper>
  )
}

export default TenpaiLabel
