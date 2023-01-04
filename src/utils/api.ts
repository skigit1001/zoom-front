const OPEN_WEATHER_API_KEY = '1d8ca134f1e43f5e9f87f0e7b372fb86'

export interface OpenWeatherData {
  name: string
  main: {
    feels_like: number
    humidity: number
    pressure: number
    temp: number
    temp_min: number
    temp_max: number
  }
  weather: {
    description: string
    icon: string
    id: number
    main: string
  }[]
  wind: {
    deg: number
    speed: number
  }
}

export type OpenWeatherTempScale = 'metric' | 'imperial'

export const fetchOpenWeatherData = async (
  city: string,
  tempScale: OpenWeatherTempScale
): Promise<OpenWeatherData> => {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${tempScale}&appid=${OPEN_WEATHER_API_KEY}`
  )

  if (!res.ok) {
    throw new Error('City not found')
  }

  return await res.json()
}
