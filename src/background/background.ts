import { fetchOpenWeatherData } from '../utils/api'
import {
  getStoredCities,
  getStoredOpts,
  setStoredCities,
  setStoredOpts,
} from '../utils/storage'

// to set a default value after extension installed
chrome.runtime.onInstalled.addListener(() => {
  setStoredCities([])
  setStoredOpts({
    tempScale: 'metric',
    homeCity: '',
    hasAutoOverlay: false,
  })

  chrome.contextMenus.create({
    contexts: ['selection'],
    title: 'Check city weather',
    id: 'weatherExtension',
  })

  chrome.alarms.create({
    periodInMinutes: 1 / 6,
  })
})

chrome.contextMenus.onClicked.addListener(evt => {
  getStoredCities().then(cities =>
    setStoredCities([...cities, evt.selectionText])
  )
})

chrome.alarms.onAlarm.addListener(() => {
  getStoredOpts().then(opts => {
    if (!opts.homeCity || !opts.tempScale) return

    fetchOpenWeatherData(opts.homeCity, opts.tempScale).then(data => {
      const temp = Math.round(data.main.temp)
      const symbol = opts.tempScale === 'metric' ? '\u2103' : '\u2109'
      chrome.action.setBadgeText({
        text: `${temp}${symbol}`,
      })
    })
  })
})
