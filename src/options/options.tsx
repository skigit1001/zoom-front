import React, { ChangeEvent, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import {
  getStoredOpts,
  LocalStorageOpts,
  setStoredOpts,
} from '../utils/storage'

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material'

import './options.css'
import '@fontsource/roboto'

type FormState = 'ready' | 'saving'

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOpts | null>(null)
  const [formState, setFormState] = useState<FormState>('ready')
  useEffect(() => {
    getStoredOpts().then(opts => setOptions(opts))
  }, [])

  const handleCityChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setOptions(prevOpts => ({
      ...prevOpts,
      homeCity: evt.target.value,
    }))
  }

  const handleAutoOverlayChange = (hasAutoOverlay: boolean) => {
    setOptions(prevOpts => ({
      ...prevOpts,
      hasAutoOverlay,
    }))
  }

  const handleSaveClick = () => {
    setFormState('saving')
    setStoredOpts(options)
    setTimeout(() => setFormState('ready'), 1000)
  }

  if (!options) return null

  const isFieldDisabled = formState === 'saving'

  return (
    <Box mx="10%" my="2%">
      <Card>
        <CardContent>
          <Grid container direction="column" spacing={4}>
            <Grid item>
              <Typography variant="h4">Weather Extension Options</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1">Home city name</Typography>
              <TextField
                fullWidth
                placeholder="Enter a home city"
                onChange={handleCityChange}
                value={options.homeCity}
                disabled={isFieldDisabled}
              />
            </Grid>
            <Grid item>
              <Typography variant="body1">
                Display overlay on webpage?
              </Typography>
              <Switch
                color="primary"
                checked={options.hasAutoOverlay}
                onChange={(_, checked) => handleAutoOverlayChange(checked)}
                disabled={isFieldDisabled}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveClick}
                disabled={isFieldDisabled}
              >
                {formState === 'ready' ? 'Save' : 'Saving...'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
