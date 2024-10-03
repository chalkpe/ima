import { FC, useRef, useState } from 'react'
import { Stack } from '@mui/material'
import SketchInput from '@ima/client/components/sketch-input'
import SketchButton from '@ima/client/components/sketch-button'

const COLOR = '#6364ff'

interface FediverseButtonProps {
  size: number
}

const FediverseButton: FC<FediverseButtonProps> = ({ size }) => {
  const [open, setOpen] = useState(false)
  const [domain, setDomain] = useState('')

  const formRef = useRef<HTMLFormElement>(null)

  if (open) {
    return (
      <form method="get" action={`/api/fediverse/auth`} ref={formRef}>
        <Stack spacing="1vmin" direction="row">
          <SketchInput
            size={size}
            autoFocus
            name="domain"
            value={domain}
            onChange={setDomain}
            placeholder="주소 (예: planet.moe)"
            onBlur={() => setOpen(false)}
            style={{ flex: 1 }}
          />
          <SketchButton
            disabled={!domain || !domain.includes('.')}
            onClick={() => formRef.current?.submit()}
            onMouseDown={(e) => e.preventDefault()}
            style={{ fontSize: `${size}vmin`, padding: '1vmin 2vmin', backgroundColor: COLOR }}
          >
            확인
          </SketchButton>
        </Stack>
      </form>
    )
  }

  return (
    <SketchButton
      onClick={() => setOpen(true)}
      style={{ width: '50vmin', fontSize: `${size}vmin`, padding: '1vmin 2vmin', backgroundColor: COLOR }}
    >
      마스토돈으로 시작하기
    </SketchButton>
  )
}

export default FediverseButton
