import { FC, useEffect } from 'react'
import { Avatar, Box, Button, Typography } from '@mui/material'
import { LockOutlined } from '@mui/icons-material'
import { trpc } from '@ima/client/utils/trpc'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { usernameAtom } from '@ima/client/store/username'

const Entry: FC = () => {
  const navigate = useNavigate()
  const setUsername = useSetAtom(usernameAtom)
  const { data } = trpc.entry.me.useQuery(undefined, { refetchInterval: 1000 })
  useEffect(() => {
    if (data?.username) {
      setUsername(data.username)
      navigate('/lobby')
    }
  }, [data, navigate, setUsername])

  return (
    <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlined />
      </Avatar>
      <Typography variant="h5">이름을 입력하세요</Typography>

      <Box sx={{ mt: 1 }}>
        <form action="/api/twitter/auth" method="get">
          <Button fullWidth variant="contained" type="submit">
            입장하기
          </Button>
        </form>
      </Box>
    </Box>
  )
}

export default Entry
