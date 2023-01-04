import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import WeatherCard from '../components/WeatherCard'

import { Card } from '@mui/material'
import Draggable from 'react-draggable'

import './contentScript.css'
import { getStoredOpts, LocalStorageOpts } from '../utils/storage'

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOpts | null>(null)
  const [isActive, setIsActive] = useState<boolean>(false)

  useEffect(() => {
    getStoredOpts().then(opts => {
      setOptions(opts)
      setIsActive(opts.hasAutoOverlay)
    })
  }, [])

  if (!options) return null

  return (
    <>
      {isActive && (
        <Draggable>
          <Card className="overlay-card">
            <WeatherCard
              city={options.homeCity}
              tempScale={options.tempScale}
              onDelete={() => setIsActive(false)}
            />
          </Card>
        </Draggable>
      )}
    </>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
