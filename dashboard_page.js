import Link from 'next/link'
import Navbar from '../../components/Navbar'

const cards = [
  { icon: '🔬', badge: 'AI-Powered', badgeBg: '#d0f2d6', badgeColor: '#1e5c2a', title: 'Crop Disease Scanner', desc: 'Upload a photo of your plant to instantly detect diseases, pest damage, and nutrient deficiencies.', href: '/scan' },
  { icon: '🌤', badge: 'Live Data', badgeBg: '#d0f2d6', badgeColor: '#1e5c2a', title: 'Weather Forecast', desc: 'City-by-city weather with farming-specific advice for irrigation, spraying, and planting windows.', href: '/weather' },
  { icon: '💧', badge: '4 Sensors', badgeBg: '#fef3c7', badgeColor: '#d97706', title: 'Soil Moisture Levels', desc: 'Monitor real-time soil moisture from your sensor network. Get automated irrigation recommendations.', href: '/moisture' },
  { icon: '🧑‍🌾', badge: '24/7', badgeBg: '#d0f2d6', badgeColor: '#1e5c2a', title: 'Expert AI Assistant', desc: 'Get instant answers to all your farming questions — crop cycles, soil chemistry, pest management, and more.', href: '/chat' },
]

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--green-900)', color: 'white', padding: '2rem' }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>Farm Dashboard</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>All your agricultural tools in one place</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
        {cards.map(c => (
          <Link key={c.href} href={c.href} style={{ textDecoration: 'none' }}>
            <div className="hover-lift" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
              <div style={{ fontSize: '2rem' }}>{c.icon}</div>
              <span style={{ alignSelf: 'flex-start', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em', background: c.badgeBg, color: c.badgeColor }}>{c.badge}</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
