import { CSSProperties, FC } from 'react'
import { Typography } from '@mui/material'
import type { User } from '@ima/server/types/game'

interface UserHandleProps {
  user: User
  fontSize: number
  fontWeight?: string
  style?: CSSProperties
}

const UserHandle: FC<UserHandleProps> = ({ user, fontSize, fontWeight, style }) => {
  return (
    <Typography fontSize={`${fontSize}vmin`} fontWeight={fontWeight} style={style}>
      {user.nickname || user.displayName}
    </Typography>
  )
}

export default UserHandle
