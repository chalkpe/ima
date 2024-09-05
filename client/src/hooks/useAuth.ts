import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { skipToken } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { usernameAtom } from '@ima/client/store/username'

const useAuth = () => {
  const navigate = useNavigate()
  const username = useAtomValue(usernameAtom)
  const skip = username ? undefined : skipToken

  useEffect(() => {
    if (!username) navigate('/')
  }, [navigate, username])

  return { username, skip } as const
}

export default useAuth
