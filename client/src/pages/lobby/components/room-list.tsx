import { FC } from 'react'
import { CircularProgress, IconButton, List, ListItem, Stack, Typography } from '@mui/material'
import { BlockOutlined, LoginOutlined } from '@mui/icons-material'
import UserHandle from '@ima/client/components/user-handle'
import { trpc } from '@ima/client/utils/trpc'
import type { LobbyRoom } from '@ima/server/types/game'

interface RoomListProps {
  list?: LobbyRoom[]
}

const RoomList: FC<RoomListProps> = ({ list }) => {
  const utils = trpc.useUtils()
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
    <List>
      {list.map((room) => (
        <ListItem
          key={room.host}
          secondaryAction={
            <IconButton edge="end" onClick={() => join({ host: room.host })} sx={{ fontSize: '4vmin' }}>
              {room.guestUser ? <BlockOutlined fontSize="inherit" /> : <LoginOutlined fontSize="inherit" />}
            </IconButton>
          }
        >
          <Stack direction="row" gap="1vmin">
            {room.hostUser && <UserHandle {...room.hostUser} fontSize={4} />}
            {room.guestUser && (
              <>
                <Typography fontSize="4vmin"> vs </Typography>
                <UserHandle {...room.guestUser} fontSize={4} />
              </>
            )}
          </Stack>
        </ListItem>
      ))}
    </List>
  )
}

export default RoomList
