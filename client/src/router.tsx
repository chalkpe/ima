import { createBrowserRouter } from 'react-router-dom'
import Entry from './routes/entry'
import Lobby from './routes/lobby'
import Room from './routes/room'
import Game from './routes/game'

const router = createBrowserRouter([
  { path: '/game', element: <Game /> },
  { path: '/room', element: <Room /> },
  { path: '/lobby', element: <Lobby /> },
  { path: '/', element: <Entry /> },
])

export default router
