import { OpenWeatherTempScale } from './api'

export interface LocalStorage {
  cities?: string[]
  options?: LocalStorageOpts
}

export interface LocalStorageOpts {
  tempScale: OpenWeatherTempScale
  homeCity: string
}

export type LocalStorageKeys = keyof LocalStorage

export const setStoredCities = (cities: string[]): Promise<void> => {
  const vals: LocalStorage = { cities }

  return new Promise(resolve => {
    chrome.storage.local.set(vals, resolve)
  })
}

export const getStoredCities = (): Promise<string[]> => {
  const keys: LocalStorageKeys[] = ['cities']

  return new Promise(resolve => {
    chrome.storage.local.get(keys, (result: LocalStorage) =>
      resolve(result.cities ?? [])
    )
  })
}

export const setStoredOpts = (options: LocalStorageOpts): Promise<void> => {
  const vals: LocalStorage = {
    options,
  }

  return new Promise(resolve => chrome.storage.local.set(vals, resolve))
}

export const getStoredOpts = (): Promise<LocalStorageOpts> => {
  const keys: LocalStorageKeys[] = ['options']

  return new Promise(resolve =>
    chrome.storage.local.get(keys, (result: LocalStorage) =>
      resolve(result.options)
    )
  )
}
