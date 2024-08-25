import { useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { trpc } from '../utils/trpc'
import { useNavigate } from 'react-router-dom'
import Hand from '../components/Hand'
import { Stack } from '@mui/material'
import Mahgen from '../components/Mahgen'
import { convertTileToCode } from '../utils/tile'

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

      <h2>Dora</h2>
      <div>
        {data.wall.kingTiles.map((tile, index) => (
          <Mahgen key={tile.type + tile.value + index} sequence={convertTileToCode(tile)} />
        ))}
      </div>
      
      <h2>Host</h2>
      <Hand hand={data.host.hand} />

      <h2>Guest</h2>
      <Hand hand={data.guest.hand} />

      <h2>Wall</h2>
      <div>
        {data.wall.tiles.map((tile, index) => (
          <Mahgen key={tile.type + tile.value + index} sequence={convertTileToCode(tile)} />
        ))}
      </div>
    </Stack>
  )
}

export default Game
