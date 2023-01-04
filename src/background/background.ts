import { setStoredCities, setStoredOpts } from '../utils/storage'

// to set a default value after extension installed
chrome.runtime.onInstalled.addListener(() => {
  setStoredCities([])
  setStoredOpts({
    tempScale: 'metric',
    homeCity: '',
    hasAutoOverlay: false,
  })
})
