import { FC } from 'react'
import SketchBox from '@ima/client/components/sketch-box'
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
  end: '종료',
}

const typeColor: Record<StateChangeType, string> = {
  kan: '#4caf50',
  pon: '#42a5f5',
  chi: '#03a9f4',
  nuki: '#03a9f4',
  riichi: '#ff9800',
  tsumo: '#ef5350',
  ron: '#ef5350',
  update: '',
  start: '#ffffff',
  end: '#ffffff',
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
      PaperProps={{ sx: { overflow: 'hidden', backgroundColor: typeColor[type] } }}
    >
      <SketchBox>
        <Typography fontSize="10vmin" margin="0vmin 3vmin">
          {typeText[type]}
        </Typography>
      </SketchBox>
    </Dialog>
  )
}

export default StateChange
