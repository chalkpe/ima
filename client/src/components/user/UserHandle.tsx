import { Stack, Typography } from '@mui/material'
import { FC } from 'react'

interface UserHandleProps {
  username: string
  displayName: string
  fontSize: number
  fontWeight?: string
}

const UserHandle: FC<UserHandleProps> = ({ username, displayName, fontSize, fontWeight }) => {
  return (
    <Stack direction="row" alignItems="end" gap={`${fontSize * 0.25}vmin`}>
      <Typography fontSize={`${fontSize}vmin`} fontWeight={fontWeight}>
        {displayName}
      </Typography>
      <Typography fontSize={`${fontSize * 0.85}vmin`} fontWeight={fontWeight}>
        @{username}
      </Typography>
    </Stack>
  )
}

export default UserHandle
