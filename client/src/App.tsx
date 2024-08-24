import './App.css'
import { useState } from 'react'
import { trpc } from './utils/trpc'

function App() {
  const [randomNumber, setRandomNumber] = useState(0)

  trpc.randomNumber.useSubscription(undefined, {
    onData(data) {
      setRandomNumber(data.randomNumber)
    },
  })

  return (
    <>
      <h1>Random Number: {randomNumber}</h1>
    </>
  )
}

export default App
