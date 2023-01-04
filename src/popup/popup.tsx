import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import {
  getStoredCities,
  getStoredOpts,
  LocalStorageOpts,
  setStoredCities,
  setStoredOpts,
} from '../utils/storage'

import WeatherCard from '../components/WeatherCard'

import { Box, Grid, InputBase, IconButton, Paper } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import '@fontsource/roboto'
import './popup.css'

const App: React.FC<{}> = () => {
  const [cities, setCities] = useState<string[]>([])
  const [cityInput, setCityInput] = useState<string>('')
  const [options, setOptions] = useState<LocalStorageOpts | null>(null)

  useEffect(() => {
    getStoredCities().then(cities => setCities(cities))
    getStoredOpts().then(opts => setOptions(opts))
  }, [])

  const handleCityAddClick = () => {
    if (!cityInput) return

    const updatedCities = [...cities, cityInput]
    setStoredCities(updatedCities).then(() => {
      setCities(updatedCities)
      setCityInput('')
    })
  }

  const handleCityDelete = (index: number) => {
    const updatedCities = cities.filter((_, i) => i !== index)
    setStoredCities(updatedCities).then(() => setCities(updatedCities))
  }

  const handleTempScaleToggle = () => {
    const updatedOptions: LocalStorageOpts = {
      ...options,
      tempScale: options.tempScale === 'metric' ? 'imperial' : 'metric',
    }
    setStoredOpts(updatedOptions).then(() => setOptions(updatedOptions))
  }

  if (!options) return null

  return (
    <Box mx="8px" my="16px">
      <Grid container justifyContent="space-evenly">
        <Grid item>
          <Paper>
            <Box px="15px" py="5px">
              <InputBase
                value={cityInput}
                onChange={evt => setCityInput(evt.target.value)}
                placeholder="Add a city name"
              />
              <IconButton onClick={handleCityAddClick}>
                <AddIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
        <Grid item>
          <Paper>
            <Box py="4px">
              <IconButton onClick={handleTempScaleToggle}>
                {options.tempScale === 'metric' ? '\u2103' : '\u2109'}
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {options.homeCity && (
        <WeatherCard city={options.homeCity} tempScale={options.tempScale} />
      )}
      {cities.map((city, i) => (
        <WeatherCard
          tempScale={options.tempScale}
          city={city}
          key={i}
          onDelete={() => handleCityDelete(i)}
        />
      ))}
    </Box>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
