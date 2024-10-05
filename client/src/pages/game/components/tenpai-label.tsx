import { FC, useMemo } from 'react'
import { Typography, useTheme } from '@mui/material'
import SketchBox from '@ima/client/components/sketch-box'
import { calculateTenpaiState } from '@ima/client/utils/game'
import type { Tenpai } from '@ima/server/types/tenpai'

interface TenpaiLabelProps {
  list: Tenpai[]
}

const TenpaiLabel: FC<TenpaiLabelProps> = ({ list }) => {
  const theme = useTheme()
  const state = useMemo(() => calculateTenpaiState(list), [list])

  if (!state) return null
  return (
    <SketchBox
      style={{
        opacity: state.isYakuman ? 0.75 : 0.5,
        position: 'absolute',
        left: '2vmin',
        bottom: '25.75vmin',
        backgroundColor: theme.palette.mode === 'dark' ? state.color.dark : state.color.light,
      }}
    >
      <Typography fontSize="2.5vmin" fontWeight={state.isYakuman ? 'bold' : undefined}>
        {state.text}
      </Typography>
    </SketchBox>
  )
}

export default TenpaiLabel
