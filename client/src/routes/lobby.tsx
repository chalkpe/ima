import { useEffect } from 'react'
import { Box, Button, CircularProgress, IconButton, List, ListItem, Stack } from '@mui/material'
import { BlockOutlined, CheckOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@ima/client/utils/trpc'
import useAuth from '@ima/client/hooks/useAuth'

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
    <Box maxWidth="50vmin">
      <h1>로비</h1>

      <Stack direction="row" gap="2vmin">
        <Button variant="contained" onClick={() => create()}>
          방 생성
        </Button>

        <Button
          variant="contained"
          onClick={() => {
            setToken('')
            navigate('/')
          }}
        >
          나가기
        </Button>
      </Stack>

      <h2>접속자</h2>
      {list ? (
        <List>
          {list.map((room) => (
            <ListItem
              key={room.host}
              secondaryAction={
                <IconButton edge="end" onClick={() => join({ host: room.host })}>
                  {room.started ? <BlockOutlined /> : <CheckOutlined />}
                </IconButton>
              }
            >
              {room.host} vs {room.guest}
            </ListItem>
          ))}
        </List>
      ) : (
        <p>
          <CircularProgress />
        </p>
      )}
    </Box>
  )
}

export default Lobby
