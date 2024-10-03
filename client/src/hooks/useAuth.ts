import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { skipToken } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { tokenAtom } from '@ima/client/store/token'
import { jwtDecode } from 'jwt-decode'

interface AuthPayload {
  id: string
}

const useAuth = () => {
  const navigate = useNavigate()
  const [token, setToken] = useAtom(tokenAtom)
  const [payload, setPayload] = useState<AuthPayload | null>()

  useEffect(() => {
    if (!token) {
      setPayload(null)
      return
    }
    try {
      setPayload(jwtDecode<AuthPayload>(token))
    } catch (error) {
      setPayload(null)
      console.error(error)
    }
  }, [token])

  const skip = useMemo(() => (payload ? undefined : skipToken), [payload])

  useEffect(() => {
    if (payload === null) {
      navigate('/')
    }
  }, [navigate, payload])

  return { skip, payload, setToken } as const
}

export default useAuth
