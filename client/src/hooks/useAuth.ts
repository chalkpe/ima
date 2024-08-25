import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { skipToken } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { usernameAtom } from '../store/username'
import { trpc } from '../utils/trpc'

const useAuth = () => {
  const navigate = useNavigate()
  const username = useAtomValue(usernameAtom)
  const skip = username ? undefined : skipToken

  trpc.ping.useQuery(skip, { refetchInterval: 1000 })
  useEffect(() => {
    if (!username) navigate('/')
  }, [navigate, username])

  return skip
}

export default useAuth
