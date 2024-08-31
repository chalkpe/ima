import { useEffect } from 'react'
import { Box, Button, CircularProgress, IconButton, List, ListItem } from '@mui/material'
import { BlockOutlined, CheckOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { trpc } from '../utils/trpc'
import useAuth from '../hooks/useAuth'

const Lobby = () => {
  const navigate = useNavigate()
  const { skip } = useAuth()
  const utils = trpc.useUtils()
  const { data: list } = trpc.lobby.list.useQuery(skip, { refetchInterval: 1000 })
  const { data: room, error } = trpc.lobby.room.useQuery(skip)
  const { mutate: create } = trpc.lobby.create.useMutation({ onSuccess: () => utils.lobby.room.reset() })
  const { mutate: join } = trpc.lobby.join.useMutation({ onSuccess: () => utils.lobby.room.reset() })

  useEffect(() => {
    if (room && !error) {
      navigate('/room')
    }
  }, [room, navigate, error])

  return (
    <Box maxWidth="50vmin">
      <h1>로비</h1>

      <Button variant="contained" onClick={() => create()}>
        방 생성
      </Button>

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
