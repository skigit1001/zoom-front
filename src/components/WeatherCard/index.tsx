import React, { useEffect, useState } from 'react'

import {
  fetchOpenWeatherData,
  getWeatherIconSrc,
  OpenWeatherData,
  OpenWeatherTempScale,
} from '../../utils/api'

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'

import './WeatherCard.css'

const WeatherCardContainer: React.FC<{
  children: React.ReactNode
  onDelete?: () => void
}> = ({ children, onDelete }) => {
  return (
    <Box className="weather-card" mx="4px" my="16px">
      <Card>
        <CardContent>{children}</CardContent>
        <CardActions>
          {onDelete && (
            <Button color="secondary" onClick={onDelete}>
              Delete
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  )
}

type WeatherCardState = 'loading' | 'error' | 'ready'

const WeatherCard: React.FC<{
  city: string
  tempScale: OpenWeatherTempScale
  onDelete?: () => void
}> = ({ city, tempScale, onDelete }) => {
  const [weatherData, setWeatherData] = useState<OpenWeatherData | null>(null)
  const [cardState, setCardState] = useState<WeatherCardState>('loading')

  useEffect(() => {
    fetchOpenWeatherData(city, tempScale)
      .then(data => {
        setWeatherData(data)
        setCardState('ready')
      })
      .catch(_ => setCardState('error'))
  }, [city, tempScale])

  if (cardState === 'loading' || cardState === 'error')
    return (
      <WeatherCardContainer onDelete={onDelete}>
        <Typography>{city}</Typography>
        <Typography variant="body1">
          {cardState === 'loading'
            ? 'Loading...'
            : 'Error: could not retrive weather data for this city.'}
        </Typography>
      </WeatherCardContainer>
    )

  return (
    <WeatherCardContainer onDelete={onDelete}>
      <Grid container justifyContent="space-around" alignItems="end">
        <Grid item>
          <Typography textAlign="center" variant="h5">
            {weatherData.name}
          </Typography>
          <Typography
            sx={{
              fontSize: '64px',
              textAlign: 'center',
            }}
            variant="body1"
          >
            {Math.round(weatherData.main.temp)}
          </Typography>
          <Typography textAlign="center" variant="body1">
            Feels like: {Math.round(weatherData.main.feels_like)}
          </Typography>
        </Grid>
        <Grid item>
          {weatherData.weather.length > 0 && (
            <>
              <img src={getWeatherIconSrc(weatherData.weather[0].icon)} />
              <Typography textAlign="center" variant="body1">
                {weatherData.weather[0].main}
              </Typography>
            </>
          )}
        </Grid>
      </Grid>
    </WeatherCardContainer>
  )
}

export default WeatherCard
