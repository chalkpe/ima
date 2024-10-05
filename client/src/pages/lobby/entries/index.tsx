import { useEffect, useState } from 'react'
import { Stack, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@ima/client/utils/trpc'
import useAuth from '@ima/client/hooks/useAuth'
import SketchButton from '@ima/client/components/sketch-button'
import RoomList from '@ima/client/pages/lobby/components/room-list'
import MyProfile from '@ima/client/pages/lobby/components/my-profile'

const Lobby = () => {
  const theme = useTheme()

  const navigate = useNavigate()
  const { skip, setToken } = useAuth()
  const utils = trpc.useUtils()
  const { data: list } = trpc.lobby.list.useQuery(skip, { refetchInterval: 1000 })
  const { data: room } = trpc.lobby.room.useQuery(skip, { refetchInterval: 1000 })
  const { mutate: create } = trpc.lobby.create.useMutation({ onSuccess: () => utils.lobby.room.reset() })

  const [tab, setTab] = useState<'list' | 'profile'>('list')

  useEffect(() => {
    if (skip) return
    if (room) navigate('/room')
  }, [room, navigate, skip])

  return (
    <Stack direction="column" gap="2vmin">
      <Stack direction="row" gap="2vmin" justifyContent="space-between">
        <Typography fontSize="7vmin" fontWeight="bold">
          로비
        </Typography>
        <Stack direction="row" gap="2vmin">
          <SketchButton
            onClick={() => {
              setToken('')
              navigate('/')
            }}
            style={{ fontSize: '4vmin', padding: '1vmin 2vmin', backgroundColor: '#ff9800' }}
          >
            로그아웃
          </SketchButton>
          <SketchButton
            onClick={() => create()}
            style={{ fontSize: '4vmin', padding: '1vmin 2vmin', backgroundColor: theme.palette.background.paper }}
          >
            방 생성
          </SketchButton>
        </Stack>
      </Stack>

      <Stack direction="row" gap="2vmin">
        <SketchButton
          style={{ fontSize: '5vmin', padding: '1vmin 2vmin' }}
          onClick={() => setTab('list')}
          active={tab === 'list'}
        >
          목록
        </SketchButton>
        <SketchButton
          style={{ fontSize: '5vmin', padding: '1vmin 2vmin' }}
          onClick={() => setTab('profile')}
          active={tab === 'profile'}
        >
          프로필
        </SketchButton>
      </Stack>

      {tab === 'list' && <RoomList list={list} />}
      {tab === 'profile' && <MyProfile />}
    </Stack>
  )
}

export default Lobby
