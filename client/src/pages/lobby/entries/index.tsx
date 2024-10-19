import { useEffect, useState } from 'react'
import { Stack, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { trpc } from '@ima/client/utils/trpc'
import useAuth from '@ima/client/hooks/useAuth'
import SketchButton from '@ima/client/components/sketch-button'
import RoomList from '@ima/client/pages/lobby/components/room-list'
import MyProfile from '@ima/client/pages/lobby/components/my-profile'
import UserPreference from '@ima/client/pages/lobby/components/user-preference'
import BackgroundImage from '@ima/client/components/background-image'

const tabs = [
  { label: '목록', value: 'list', component: RoomList },
  { label: '프로필', value: 'profile', component: MyProfile },
  { label: '환경설정', value: 'preference', component: UserPreference },
] as const

type Tab = (typeof tabs)[number]['value']

const Lobby = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { payload, skip, setToken } = useAuth()
  const utils = trpc.useUtils()
  const { data: room } = trpc.lobby.room.useQuery(skip, { refetchInterval: 1000 })
  const { mutate: create } = trpc.lobby.create.useMutation({ onSuccess: () => utils.lobby.room.reset() })

  const [tab, setTab] = useState<Tab>(tabs[0].value)

  useEffect(() => {
    if (payload === null) navigate('/')
    if (skip) return
    if (room) navigate('/room')
  }, [room, navigate, skip, payload])

  return (
    <>
      <BackgroundImage type="lobby" />
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
          {tabs.map(({ label, value }) => (
            <SketchButton
              key={value}
              active={tab === value}
              onClick={() => setTab(value)}
              style={{ fontSize: '5vmin', padding: '1vmin 2vmin' }}
            >
              {label}
            </SketchButton>
          ))}
        </Stack>

        {tabs.map(({ value, component: Component }) => tab === value && <Component key={value} />)}
      </Stack>
    </>
  )
}

export default Lobby
