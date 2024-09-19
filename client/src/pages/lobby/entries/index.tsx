import { useEffect } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@ima/client/utils/trpc'
import useAuth from '@ima/client/hooks/useAuth'
import RoomList from '@ima/client/pages/lobby/components/room-list'

const Lobby = () => {
  const navigate = useNavigate()
  const { skip, setToken } = useAuth()
  const utils = trpc.useUtils()
  const { data: list } = trpc.lobby.list.useQuery(skip, { refetchInterval: 1000 })
  const { data: room, error } = trpc.lobby.room.useQuery(skip)
  const { mutate: create } = trpc.lobby.create.useMutation({ onSuccess: () => utils.lobby.room.reset() })

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
      <RoomList list={list} />
    </Stack>
  )
}

export default Lobby
