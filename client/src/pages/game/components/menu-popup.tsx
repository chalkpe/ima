import { FC, useState } from 'react'
import { Stack, Typography } from '@mui/material'
import SketchBox from '@ima/client/components/sketch-box'
import SketchButton from '@ima/client/components/sketch-button'

const MenuPopup: FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SketchButton
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',
          top: '13vmin',
          right: '10vmin',
          width: '7vmin',
          height: '7vmin',
          backgroundColor: '#cadf9f',
          opacity: 0.75,
        }}
      >
        <Typography fontSize="2.5vmin">메뉴</Typography>
      </SketchButton>

      {open && (
        <div
          style={{
            zIndex: 1,
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <SketchBox
          style={{
            zIndex: 2,
            position: 'absolute',
            top: '37.5vmin',
            left: '30vmin',
            width: '40vmin',
            height: '25vmin',
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
          }}
        >
          <Stack direction="column" gap="1vmin" alignItems="center" justifyContent="center" height="22.5vmin">
            <SketchButton
              onClick={() => {
                // TODO
              }}
              style={{
                backgroundColor: 'white',
                minWidth: '12vmin',
                maxWidth: '12vmin',
                minHeight: '4vmin',
                maxHeight: '4vmin',
              }}
            >
              <Typography fontSize="3vmin">환경설정</Typography>
            </SketchButton>
            <SketchButton
              onClick={() => {
                // TODO
              }}
              style={{
                backgroundColor: 'white',
                minWidth: '12vmin',
                maxWidth: '12vmin',
                minHeight: '4vmin',
                maxHeight: '4vmin',
              }}
            >
              <Typography fontSize="3vmin">중단투표</Typography>
            </SketchButton>
          </Stack>
        </SketchBox>
      )}
    </>
  )
}

export default MenuPopup
