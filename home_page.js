import Link from 'next/link'
import Navbar from '../components/Navbar'

const features = [
  { icon: '🔬', title: 'AI Crop Scanner', desc: 'Upload a photo. Instantly detect diseases, deficiencies & pests with treatment advice.', href: '/scan', bg: '#eafaec' },
  { icon: '🌤', title: 'Weather Forecast', desc: 'Hyperlocal weather with farming-specific advice on irrigation, spraying & planting.', href: '/weather', bg: '#e0f2fe' },
  { icon: '💧', title: 'Moisture Monitor', desc: 'Track soil moisture across field zones. Get automated irrigation recommendations.', href: '/moisture', bg: '#fef3c7' },
  { icon: '🧑‍🌾', title: 'Expert AI Assistant', desc: 'Ask anything — crop cycles, soil chemistry, pest management, and more.', href: '/chat', bg: '#f3e8ff' },
]

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--green-900) 0%, var(--green-800) 50%, var(--green-700) 100%)', padding: '5rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(58,184,78,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(109,209,126,0.1) 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--green-300)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.35rem 1rem', borderRadius: 20, marginBottom: '1.5rem' }}>
            Smart Agriculture Platform
          </span>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: 'white', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Grow smarter with<br />
            <span style={{ color: 'var(--green-400)' }}>AI-powered insights</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Real-time crop scanning, weather intelligence, and soil monitoring — everything a modern farmer needs in one place.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{ background: 'var(--green-500)', color: 'white', padding: '0.85rem 2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
              Explore Dashboard
            </Link>
            <Link href="/scan" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '0.85rem 2rem', borderRadius: 8, fontWeight: 500, fontSize: '0.95rem', textDecoration: 'none' }}>
              Scan a Crop
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        {features.map(f => (
          <Link key={f.href} href={f.href} style={{ textDecoration: 'none' }}>
            <div className="hover-lift" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', cursor: 'pointer', height: '100%' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              <span style={{ color: 'var(--green-600)', marginTop: '0.75rem', display: 'block', fontSize: '1.1rem' }}>→</span>
            </div>
          </Link>
        ))}
      </section>
    </>
  )
}
