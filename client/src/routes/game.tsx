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
import Scoreboard from '../components/game/Scoreboard'

const Game = () => {
  const navigate = useNavigate()
  const { username, skip } = useAuth()

  const utils = trpc.useUtils()
  const { data, error } = trpc.game.state.useQuery(skip)
  trpc.game.onStateChange.useSubscription(skip, {
    onData: () => {
      utils.game.state.invalidate()
      utils.game.getRemainingTileCount.invalidate()
    },
  })

  useEffect(() => {
    if (!data || error) {
      navigate('/lobby')
    }
  }, [data, error, navigate])

  if (!data) return null

  const me = data.host === username ? 'host' : 'guest'
  const opponent = data.host === username ? 'guest' : 'host'
  return (
    <>
      <Center state={data.state} me={me} />
      <Wall wall={data.state.wall} />
      <KingTiles wall={data.state.wall} />

      <Hand hand={data.state[opponent].hand} />
      <River river={data.state[opponent].river} />

      <River river={data.state[me].river} me />
      <Hand hand={data.state[me].hand} me />

      <Decisions decisions={data.state[me].decisions} />
      <Scoreboard data={data} />
    </>
  )
}

export default Game
