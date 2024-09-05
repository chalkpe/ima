import { FC } from 'react'
import { Backdrop, Dialog, Typography } from '@mui/material'
import type { StateChangeType } from '@ima/server/types/game'

const typeText: Record<StateChangeType, string> = {
  kan: '깡',
  pon: '퐁',
  chi: '치',
  nuki: '빼기',
  riichi: '리치',
  tsumo: '쯔모',
  ron: '론',
  update: '',
  start: '시작',
}

interface StateChangeProps {
  type: StateChangeType
}

const StateChange: FC<StateChangeProps> = ({ type }) => {
  if (type === 'update') return null
  return (
    <Dialog
      open={true}
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { sx: { backgroundColor: 'transparent' } } }}
      PaperProps={{ sx: { padding: '2vmin' } }}
    >
      <Typography fontSize="10vmin">{typeText[type]}</Typography>
    </Dialog>
  )
}

export default StateChange
