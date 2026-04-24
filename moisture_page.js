import Navbar from '../../components/Navbar'

const zones = [
  { name: 'Zone A – North Field', zone: 'A', moisture: 62, temp: 24.3, ec: 1.8, status: 'good', updated: '2 min ago' },
  { name: 'Zone B – South Field', zone: 'B', moisture: 38, temp: 26.1, ec: 2.1, status: 'warn', updated: '3 min ago' },
  { name: 'Zone C – Greenhouse',  zone: 'C', moisture: 71, temp: 28.0, ec: 1.5, status: 'good', updated: '1 min ago' },
  { name: 'Zone D – Orchard',     zone: 'D', moisture: 29, temp: 25.5, ec: 2.4, status: 'bad',  updated: '5 min ago' },
]

const statusConfig = {
  good: { dot: '#3ab84e', label: 'Optimal' },
  warn: { dot: '#f59e0b', label: 'Low — Irrigate Soon' },
  bad:  { dot: '#dc2626', label: 'Critical — Irrigate Now' },
}

function moistureColor(m) {
  if (m < 35) return '#dc2626'
  if (m < 50) return '#f59e0b'
  return '#3ab84e'
}

export default function MoisturePage() {
  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem' }}>
        <h2 className="font-serif" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>💧 Soil Moisture Monitor</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Real-time soil moisture readings from your field sensors. Optimal range: 40–70% for most crops.
        </p>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {zones.map(z => (
            <div key={z.zone} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Zone {z.zone}
              </div>
              <div>
                <span className="font-serif" style={{ fontSize: '2.5rem', color: moistureColor(z.moisture) }}>{z.moisture}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>%</span>
              </div>
              <div style={{ height: 6, background: 'var(--cream-dark)', borderRadius: 3, marginTop: '0.75rem' }}>
                <div style={{ height: '100%', borderRadius: 3, background: moistureColor(z.moisture), width: `${z.moisture}%`, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cream)' }}>
                  {['Zone', 'Moisture', 'Temp (°C)', 'EC (dS/m)', 'Status', 'Last Updated'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zones.map(z => {
                  const s = statusConfig[z.status]
                  return (
                    <tr key={z.zone} style={{ borderBottom: '1px solid var(--cream-dark)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{z.name}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{z.moisture}%</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{z.temp}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{z.ec}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.dot, marginRight: 6 }} />
                        {s.label}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{z.updated}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
