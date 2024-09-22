import { CSSProperties, FC, PropsWithChildren, useCallback } from 'react'
import { WiredCheckBox } from 'react-wired-elements'
import useSketchToggle from '@ima/client/hooks/useSketchToggle'
import { Stack, Typography } from '@mui/material'

interface SketchCheckboxProps {
  size: number
  disabled?: boolean
  checked: boolean
  onChange?: (checked: boolean) => void
  style?: CSSProperties
}

const SketchCheckbox: FC<PropsWithChildren<SketchCheckboxProps>> = ({
  size,
  disabled,
  checked,
  onChange,
  style,
  children,
}) => {
  const { vmin } = useSketchToggle()
  const handleClick = useCallback(() => {
    if (!disabled) {
      onChange?.(!checked)
    }
  }, [checked, disabled, onChange])

  return (
    <Stack
      direction="row"
      alignItems="center"
      onClick={handleClick}
      gap={`${size * 0.25}vmin`}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      <WiredCheckBox
        checked={checked}
        disabled={disabled}
        style={{
          width: `${size}vmin`,
          height: `${size}vmin`,
          transformOrigin: 'top left',
          transform: `scale(${(size * vmin) / 24})`,
        }}
      />
      <Typography fontSize={`${size}vmin`}>{children}</Typography>
    </Stack>
  )
}

export default SketchCheckbox
