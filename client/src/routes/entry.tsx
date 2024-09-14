import { FC, useEffect } from 'react'
import { Avatar, Backdrop, Box, Button, CircularProgress, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { tokenAtom } from '@ima/client/store/token'
import { trpc } from '@ima/client/utils/trpc'

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
    if (token && data?.username) {
      navigate('/lobby')
    }
  }, [data, navigate, token])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Avatar sx={{ margin: '1vmin', width: '10vmin', height: '10vmin' }} src="/tiles/1s.png" />
      <Typography fontSize="3vmin">IMA (2인 마작)</Typography>
      <Box sx={{ marginTop: '2vmin' }}>
        <form action="/api/twitter/auth" method="get">
          <Button fullWidth variant="contained" type="submit">
            트위터로 시작하기
          </Button>
        </form>
      </Box>
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={!!token}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  )
}

export default Entry
