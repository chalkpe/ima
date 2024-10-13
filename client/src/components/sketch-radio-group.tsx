import { CSSProperties, FC, ReactNode } from 'react'
import { WiredRadio, WiredRadioGroup } from 'react-wired-elements'
import useSketchToggle from '@ima/client/hooks/useSketchToggle'
import { Stack, Typography } from '@mui/material'

interface SketchRadioGroupProps {
  size: number
  items: { name: string; label: ReactNode }[]
  selected: string
  onSelect: (name: string) => void
  disabled?: boolean
}

const SketchRadioGroup: FC<SketchRadioGroupProps> = ({ size, items, selected, onSelect, disabled }) => {
  const { vmin } = useSketchToggle()

  return (
    <WiredRadioGroup
      selected={selected}
      style={
        {
          display: 'flex',
          flexDirection: 'row',
          gap: `${size * 0.25}vmin`,
          '--wired-radio-group-item-padding': '0',
        } as CSSProperties
      }
    >
      {items.map((item) => (
        <Stack
          key={item.name}
          direction="row"
          alignItems="center"
          gap={`${size * 0.25}vmin`}
          onClick={() => !disabled && onSelect(item.name)}
        >
          <WiredRadio
            checked={selected === item.name}
            name={item.name}
            disabled={disabled}
            style={{
              width: `${size}vmin`,
              height: `${size}vmin`,
              transformOrigin: 'top left',
              transform: `scale(${(size * vmin) / 24})`,
            }}
          />
          <Typography fontSize={`${size}vmin`}>{item.label}</Typography>
        </Stack>
      ))}
    </WiredRadioGroup>
  )
}

export default SketchRadioGroup
