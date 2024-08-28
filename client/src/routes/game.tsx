import { useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { trpc } from '../utils/trpc'
import { useNavigate } from 'react-router-dom'
import Hand from '../components/game/Hand'
import River from '../components/game/River'
import KingTiles from '../components/game/KingTiles'
import Center from '../components/game/Center'
import Wall from '../components/game/Wall'
import Decisions from '../components/game/Decisions'

const Game = () => {
  const navigate = useNavigate()
  const { username, skip } = useAuth()
  const { data, error } = trpc.game.state.useQuery(skip, { refetchInterval: 1000 })

  useEffect(() => {
    if (!data || error) {
      navigate('/room')
    }
  }, [data, error, navigate])

  if (!data) return null

  const me = data.host === username ? 'host' : 'guest'
  const opponent = data.host === username ? 'guest' : 'host'
  return (
    <>
      <Center state={data.state} />
      <Wall tiles={data.state.wall.tiles} />
      <KingTiles tiles={data.state.wall.kingTiles} />
      
      <Hand hand={data.state[opponent].hand} />
      <River river={data.state[opponent].river} />

      <River river={data.state[me].river} me />
      <Hand hand={data.state[me].hand} me />

      <Decisions decisions={data.state[me].decisions} />
    </>
  )
}

export default Game
