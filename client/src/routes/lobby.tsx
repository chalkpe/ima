import { Button, IconButton, List, ListItem } from '@mui/material'
import { trpc } from '../utils/trpc'
import { useNavigate } from 'react-router-dom'
import { CheckOutlined } from '@mui/icons-material'
import useAuth from '../hooks/useAuth'
import { useEffect } from 'react'

const Lobby = () => {
  const navigate = useNavigate()
  
  const skip = useAuth()
  const { data: list } = trpc.lobby.list.useQuery(skip, { refetchInterval: 1000 })
  const { data: room, error } = trpc.lobby.room.useQuery(skip, { refetchInterval: 1000 })

  const { mutate: create } = trpc.lobby.create.useMutation()
  const { mutate: join } = trpc.lobby.join.useMutation()

  useEffect(() => {
    if (room && !error) {
      navigate('/room')
    }
  }, [room, navigate, error])

  return (
    <>
      <h1>로비</h1>

      <Button
        variant="contained"
        onClick={() =>
          create(undefined, {
            onSuccess: () => navigate('/room'),
          })
        }
      >
        방 생성
      </Button>

      <h2>접속자</h2>
      {list ? (
        <List>
          {list.map((room) => (
            <ListItem
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => join({ host: room.host }, { onSuccess: () => navigate('/room') })}
                >
                  <CheckOutlined />
                </IconButton>
              }
            >
              {room.host} vs {room.guest}
            </ListItem>
          ))}
        </List>
      ) : (
        <p>0명</p>
      )}
    </>
  )
}

export default Lobby
