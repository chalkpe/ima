import { FC, useEffect } from 'react'
import { Avatar, Backdrop, Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { tokenAtom } from '@ima/client/store/token'
import { trpc } from '@ima/client/utils/trpc'
import TwitterButton from '@ima/client/pages/entry/components/twitter-button'
import FediverseButton from '@ima/client/pages/entry/components/fediverse-button'

const Entry: FC = () => {
  const navigate = useNavigate()
  const [token, setToken] = useAtom(tokenAtom)
  const [searchParams, setSearchParams] = useSearchParams()
  const { data } = trpc.entry.me.useQuery(undefined, { refetchInterval: 1000 })

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setToken(token)
      setSearchParams({})
    }
  }, [navigate, searchParams, setSearchParams, setToken])

  useEffect(() => {
    if (token && data?.id) {
      navigate('/lobby')
    }
  }, [data, navigate, token])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Avatar sx={{ width: '30vmin', height: '30vmin' }} src="/tiles/1s.png" />
      <Typography fontSize="6vmin">IMA (2인 마작)</Typography>
      <Stack spacing="1vmin" sx={{ marginTop: '2vmin' }}>
        <TwitterButton size={4} />
        <FediverseButton size={4} />
      </Stack>
      <Backdrop open={!!token} sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}>
        <Stack direction="column" gap="5vmin" alignItems="center">
          <CircularProgress color="inherit" size="15vmin" />
          <Typography fontSize="5vmin">서버에 연결 중...</Typography>
        </Stack>
      </Backdrop>
    </Box>
  )
}

export default Entry
