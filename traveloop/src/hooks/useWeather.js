import { useEffect, useState } from 'react'

const mapWeatherCode = (code) => {
  if (code === 0) return '☀️'
  if (code >= 1 && code <= 3) return '⛅'
  if (code >= 45 && code <= 48) return '🌫️'
  if (code >= 51 && code <= 67) return '🌧️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 80 && code <= 82) return '🌦️'
  if (code === 95) return '⛈️'
  return '⛅'
}

export const useWeather = (lat, lng, date) => {
  const [temp, setTemp] = useState(null)
  const [condition, setCondition] = useState('⛅')

  useEffect(() => {
    if (!lat || !lng || !date) return

    let active = true

    const fetchWeather = async () => {
      try {
        const url = new URL('https://api.open-meteo.com/v1/forecast')
        url.searchParams.set('latitude', lat)
        url.searchParams.set('longitude', lng)
        url.searchParams.set('daily', 'temperature_2m_max,weathercode')
        url.searchParams.set('start_date', date)
        url.searchParams.set('end_date', date)
        url.searchParams.set('timezone', 'auto')

        const response = await fetch(url.toString())
        const data = await response.json()

        if (!active) return

        const maxTemp = data?.daily?.temperature_2m_max?.[0]
        const weatherCode = data?.daily?.weathercode?.[0]

        setTemp(typeof maxTemp === 'number' ? Math.round(maxTemp) : null)
        setCondition(mapWeatherCode(Number(weatherCode)))
      } catch {
        if (!active) return
        setTemp(null)
        setCondition('⛅')
      }
    }

    fetchWeather()

    return () => {
      active = false
    }
  }, [lat, lng, date])

  return { temp, condition }
}
