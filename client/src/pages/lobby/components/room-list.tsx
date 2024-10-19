import { FC } from 'react'
import { CircularProgress, Stack, Typography } from '@mui/material'
import UserHandle from '@ima/client/components/user-handle'
import { trpc } from '@ima/client/utils/trpc'
import SketchBox from '@ima/client/components/sketch-box'
import SketchButton from '@ima/client/components/sketch-button'
import useAuth from '@ima/client/hooks/useAuth'

const RoomList: FC = () => {
  const { skip } = useAuth()
  const utils = trpc.useUtils()
  const { data: list } = trpc.lobby.list.useQuery(skip, { refetchInterval: 1000 })
  const { mutate: join } = trpc.lobby.join.useMutation({ onSuccess: () => utils.lobby.room.reset() })

  if (!list) {
    return (
      <p>
        <CircularProgress />
      </p>
    )
  }

  if (!list.length) {
    return <Typography fontSize="4vmin">비어 있음</Typography>
  }

  return (
    <Stack direction="column">
      {list.map((room) => (
        <SketchBox key={room.host} style={{ width: '100%', padding: '1vmin 2vmin' }}>
          <Stack direction="row" justifyContent="space-between">
            <Stack direction="row" gap="1vmin" alignItems="center">
              {room.hostUser && <UserHandle user={room.hostUser} fontSize={4} />}
              {room.guestUser && (
                <>
                  <Typography fontSize="4vmin"> vs </Typography>
                  <UserHandle user={room.guestUser} fontSize={4} />
                </>
              )}
            </Stack>
            <SketchButton
              disabled={!!room.guestUser}
              onClick={() => join({ host: room.host })}
              style={{ fontSize: '4vmin', padding: '1vmin 2vmin' }}
            >
              참가
            </SketchButton>
          </Stack>
        </SketchBox>
      ))}
    </Stack>
  )
}

export default RoomList
