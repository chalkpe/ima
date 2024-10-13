import { FC, useEffect, useState } from 'react'
import { alpha, Stack, Typography, useTheme } from '@mui/material'
import SketchBox from '@ima/client/components/sketch-box'
import SketchButton from '@ima/client/components/sketch-button'
import type { PlayerType, Room } from '@ima/server/types/game'
import { trpc } from '@ima/client/utils/trpc'

interface MenuPopupProps {
  room: Room
  me: PlayerType
}

const MenuPopup: FC<MenuPopupProps> = ({ room, me }) => {
  const [open, setOpen] = useState(false)

  const { mutate: stop } = trpc.game.stop.useMutation()
  const { mutate: revertStop } = trpc.game.revertStop.useMutation()
  const { mutate: confirmStop } = trpc.game.confirmStop.useMutation()

  useEffect(() => {
    if (room.remainingTimeToStop !== null) {
      setOpen(true)
    }
  }, [room.remainingTimeToStop])

  const theme = useTheme()

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
          onClick={() => room.remainingTimeToStop === null && setOpen(false)}
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
            backgroundColor: alpha(theme.palette.background.default, 0.75),
          }}
        >
          <Stack direction="column" gap="1vmin" alignItems="center" justifyContent="center" height="22.5vmin">
            {/* {room.remainingTimeToStop === null && (
              <SketchButton
                onClick={() => {
                  // TODO
                }}
                style={{ backgroundColor: 'white', color: 'black' }}
              >
                <Typography fontSize="3vmin">환경설정</Typography>
              </SketchButton>
            )} */}
            <SketchButton
              disabled={room.remainingTimeToStop !== null}
              onClick={() => stop()}
              onDoubleClick={() => stop()}
              style={{ backgroundColor: 'white', color: 'black' }}
            >
              <Typography fontSize="3vmin">
                종료
                {room.remainingTimeToStop !== null ? `까지 ${room.remainingTimeToStop}초` : ' 요청'}
              </Typography>
            </SketchButton>

            {room.remainingTimeToStop !== null && (
              <Stack direction="row" gap="1vmin">
                <SketchButton
                  onClick={() => revertStop(undefined, { onSuccess: () => setOpen(false) })}
                  style={{ backgroundColor: '#03a9f4' }}
                >
                  <Typography fontSize="3vmin">
                    {room.stopRequestedBy?.toLowerCase() === me ? '종료 취소' : '종료 거부'}
                  </Typography>
                </SketchButton>
                {room.stopRequestedBy?.toLowerCase() !== me && (
                  <SketchButton onClick={() => confirmStop()} style={{ backgroundColor: '#ef5350' }}>
                    <Typography fontSize="3vmin">종료 동의</Typography>
                  </SketchButton>
                )}
              </Stack>
            )}
          </Stack>
        </SketchBox>
      )}
    </>
  )
}

export default MenuPopup
