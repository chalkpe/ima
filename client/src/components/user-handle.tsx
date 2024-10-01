import { FC } from 'react'
import { Stack, Typography } from '@mui/material'

interface UserHandleProps {
  displayName: string
  fontSize: number
  fontWeight?: string
}

const UserHandle: FC<UserHandleProps> = ({ displayName, fontSize, fontWeight }) => {
  return (
    <Stack direction="row" alignItems="end" gap={`${fontSize * 0.25}vmin`}>
      <Typography fontSize={`${fontSize}vmin`} fontWeight={fontWeight}>
        {displayName}
      </Typography>
    </Stack>
  )
}

export default UserHandle
