'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/scan', label: 'Scan Crop' },
  { href: '/weather', label: 'Weather' },
  { href: '/moisture', label: 'Moisture' },
  { href: '/chat', label: 'Expert AI' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <nav style={{ background: 'var(--green-900)', position: 'sticky', top: 0, zIndex: 100 }}
      className="flex items-center justify-between px-6 h-16 shadow-lg">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="text-2xl">🌱</span>
        <span style={{ fontFamily: '"DM Serif Display", serif', color: 'var(--green-300)', fontSize: '1.4rem' }}>
          AgroSense
        </span>
      </Link>
      <div className="flex items-center gap-1 overflow-x-auto">
        {links.map(({ href, label }) => (
          <Link key={href} href={href}
            className="px-3 py-2 rounded-lg text-sm font-medium no-underline transition-colors whitespace-nowrap"
            style={{
              color: pathname === href ? 'var(--green-200)' : 'var(--green-400)',
              background: pathname === href ? 'var(--green-800)' : 'transparent',
            }}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
