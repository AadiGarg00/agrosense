'use client'
import { useState } from 'react'
import Navbar from '../../components/Navbar'

const weatherIcons = { sunny: '☀️', cloudy: '⛅', rainy: '🌧', stormy: '⛈', foggy: '🌫', snowy: '❄️' }

export default function WeatherPage() {
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState('')

  async function fetchWeather() {
    if (!city.trim()) { setError('Please enter a city name.'); return }
    setLoading(true); setError(''); setWeather(null)
    try {
      const res = await fetch('/api/weather', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setWeather(data)
    } catch (e) {
      setError(e.message || 'Could not fetch weather. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem' }}>
        <h2 className="font-serif" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🌤 Weather Forecast</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Get current weather conditions with tailored agricultural advice for your area.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            value={city} onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchWeather()}
            placeholder="Enter city name (e.g. Lucknow, Pune, Delhi)"
            style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.95rem', background: 'white', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button onClick={fetchWeather} disabled={loading}
            style={{ background: 'var(--green-700)', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {loading ? 'Loading…' : 'Get Weather'}
          </button>
        </div>

        {error && <div style={{ background: 'var(--red-100)', border: '1px solid #fca5a5', borderRadius: 10, padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--red-500)' }}>{error}</div>}

        {loading && <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p style={{ color: 'var(--text-secondary)' }}>Fetching weather data…</p></div>}

        {weather && (
          <>
            <div style={{ background: 'var(--green-900)', borderRadius: 14, padding: '2rem', color: 'white', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{weather.city}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textTransform: 'capitalize' }}>{weather.description}</div>
                </div>
                <div style={{ fontSize: '3rem' }}>{weatherIcons[weather.condition] || '🌡'}</div>
              </div>
              <div className="font-serif" style={{ fontSize: '3.5rem', lineHeight: 1, marginTop: '0.5rem' }}>{Math.round(weather.temp_c)}°C</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem' }}>
                {[['Humidity', `${Math.round(weather.humidity_pct)}%`], ['Wind', `${Math.round(weather.wind_kmh)} km/h`], ['Feels like', `${Math.round(weather.feels_like_c)}°C`]].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--green-800)', marginBottom: '0.5rem' }}>🌾 Farming Advice for Today</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{weather.farming_advice}</p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
