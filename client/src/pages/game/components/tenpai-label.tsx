import { FC, useMemo } from 'react'
import { WiredCard } from 'react-wired-elements'
import { Typography } from '@mui/material'
import { calculateTenpaiState } from '@ima/client/utils/game'
import type { Tenpai } from '@ima/server/types/tenpai'

interface TenpaiLabelProps {
  list: Tenpai[]
}

const TenpaiLabel: FC<TenpaiLabelProps> = ({ list }) => {
  const state = useMemo(() => calculateTenpaiState(list), [list])

  if (!state) return null
  return (
    <WiredCard
      elevation={1}
      style={{
        opacity: state.isYakuman ? 0.75 : 0.5,
        position: 'absolute',
        left: '2vmin',
        bottom: '25.75vmin',
        padding: '1vmin',
        backgroundColor: state.color,
        userSelect: 'none',
      }}
    >
      <Typography fontSize="2.5vmin" fontWeight={state.isYakuman ? 'bold' : undefined}>
        {state.text}
      </Typography>
    </WiredCard>
  )
}

export default TenpaiLabel
