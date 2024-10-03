import { FC } from 'react'
import { Stack, Typography } from '@mui/material'
import type { User } from '@ima/server/types/game'

interface UserHandleProps {
  user: User
  fontSize: number
  fontWeight?: string
}

const UserHandle: FC<UserHandleProps> = ({ user, fontSize, fontWeight }) => {
  return (
    <Stack direction="row" alignItems="end" gap={`${fontSize * 0.25}vmin`}>
      <Typography fontSize={`${fontSize}vmin`} fontWeight={fontWeight}>
        {user.nickname || user.displayName}
      </Typography>
    </Stack>
  )
}

export default UserHandle
