import { useEffect } from 'react'
import { Button, CircularProgress, IconButton, List, ListItem, Stack, Typography } from '@mui/material'
import { BlockOutlined, LoginOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@ima/client/utils/trpc'
import useAuth from '@ima/client/hooks/useAuth'
import UserHandle from '@ima/client/components/user/UserHandle'

const Lobby = () => {
  const navigate = useNavigate()
  const { skip, setToken } = useAuth()
  const utils = trpc.useUtils()
  const { data: list } = trpc.lobby.list.useQuery(skip, { refetchInterval: 1000 })
  const { data: room, error } = trpc.lobby.room.useQuery(skip)
  const { mutate: create } = trpc.lobby.create.useMutation({ onSuccess: () => utils.lobby.room.reset() })
  const { mutate: join } = trpc.lobby.join.useMutation({ onSuccess: () => utils.lobby.room.reset() })

  useEffect(() => {
    if (skip) return
    if (room && !error) {
      navigate('/room')
    }
  }, [room, navigate, error, skip])

  return (
    <Stack direction="column" gap="2vmin">
      <Stack direction="row" gap="2vmin" justifyContent="space-between">
        <Typography fontSize="7vmin" fontWeight="bold">
          로비
        </Typography>
        <Stack direction="row" gap="2vmin">
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setToken('')
              navigate('/')
            }}
            sx={{ fontSize: '4vmin', padding: '1vmin 2vmin', borderRadius: '1vmin' }}
          >
            나가기
          </Button>
          <Button
            variant="contained"
            onClick={() => create()}
            sx={{ fontSize: '4vmin', padding: '1vmin 2vmin', borderRadius: '1vmin' }}
          >
            방 생성
          </Button>
        </Stack>
      </Stack>

      <Typography fontSize="7vmin">방 목록</Typography>
      {list?.length ? (
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
      ) : list ? (
        <Typography fontSize="4vmin">비어 있음</Typography>
      ) : (
        <p>
          <CircularProgress />
        </p>
      )}
    </Stack>
  )
}

export default Lobby
