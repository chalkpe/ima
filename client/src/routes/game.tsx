import { useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { trpc } from '../utils/trpc'
import { useNavigate } from 'react-router-dom'
import Hand from '../components/Hand'
import { Stack } from '@mui/material'
import Mahgen from '../components/Mahgen'
import { convertTileToCode } from '../utils/tile'
import KingTiles from '../components/KingTiles'
import River from '../components/River'

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
    <Stack>
      <h1>
        Game
        {data.state.turn === me && '(Your turn)'}
      </h1>

      <KingTiles tiles={data.state.wall.kingTiles} />
      <div>
        {data.state.wall.tiles.map((tile, index) => (
          <Mahgen key={tile.type + tile.value + index} sequence={convertTileToCode(tile)} size="small" />
        ))}
      </div>

      <Hand hand={data.state[opponent].hand} />
      <River river={data.state[opponent].river} />

      <River river={data.state[me].river} me />
      <Hand hand={data.state[me].hand} me />
    </Stack>
  )
}

export default Game
