import { FC, useCallback, useState } from 'react'
import { Avatar, Box, Button, TextField, Typography } from '@mui/material'
import { LockOutlined } from '@mui/icons-material'
import { useSetAtom } from 'jotai'
import { usernameAtom } from '../store/username'
import { useNavigate } from 'react-router-dom'

const Entry: FC = () => {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const setUsername = useSetAtom(usernameAtom)

  const onEnter = useCallback(() => {
    if (!input) return
    setUsername(input)
    navigate('/lobby')
  }, [input, navigate, setUsername])

  return (
    <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlined />
      </Avatar>
      <Typography variant="h5">이름을 입력하세요</Typography>

      <Box sx={{ mt: 1 }}>
        <TextField
          placeholder="이름"
          margin="normal"
          fullWidth
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value.trim())}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        />
        <Button disabled={!input} fullWidth variant="contained" onClick={onEnter}>
          입장하기
        </Button>
      </Box>
    </Box>
  )
}

export default Entry
