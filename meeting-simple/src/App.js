import React, { useState } from 'react'
import Landing from './meeting/landing'
import Meeting from './meeting'

export default function App() {
  const [isReady, setIsReady] = useState(false)

  const setReady = () => {
    setIsReady(true)
  }

  return isReady ? <Meeting /> : <Landing setReady={setReady}/> 
}
