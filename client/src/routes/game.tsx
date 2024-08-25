import { useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { trpc } from '../utils/trpc'
import { useNavigate } from 'react-router-dom'
import Hand from '../components/Hand'
import { Stack } from '@mui/material'

const Game = () => {
  const navigate = useNavigate()
  const skip = useAuth()
  const { data } = trpc.game.getGameState.useQuery(skip, { refetchInterval: 1000 })

  useEffect(() => {
    if (!data) {
      navigate('/room')
    }
  }, [data, navigate])

  if (!data) return null
  return (
    <Stack>
      <h1>Game</h1>
      <Hand hand={data.host.hand} />
      <Hand hand={data.guest.hand} />
    </Stack>
  )
}

export default Game
