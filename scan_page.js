'use client'
import { useState, useRef } from 'react'
import Navbar from '../../components/Navbar'

export default function ScanPage() {
  const [image, setImage] = useState(null)       // { src, base64 }
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      setImage({ src: e.target.result, base64: e.target.result.split(',')[1] })
      setResult(null)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  function clear() {
    setImage(null); setResult(null); setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function analyze() {
    if (!image) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: image.base64 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (e) {
      setError(e.message || 'Could not analyze image. Please try again.')
    } finally { setLoading(false) }
  }

  const statusStyle = {
    healthy:     { icon: '✅', border: 'var(--green-600)', bg: 'var(--green-100)', label: 'Healthy' },
    diseased:    { icon: '🚨', border: 'var(--red-500)',   bg: '#fee2e2',          label: 'Disease Detected' },
    deficient:   { icon: '⚠️', border: 'var(--amber-500)', bg: 'var(--amber-100)', label: 'Deficiency' },
    pest_damage: { icon: '🐛', border: '#7c3aed',          bg: '#f3e8ff',          label: 'Pest Damage' },
    uncertain:   { icon: '🔍', border: 'var(--text-muted)', bg: '#f1f5f9',         label: 'Uncertain' },
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem' }}>
        <h2 className="font-serif" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🔬 Crop Disease Scanner</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Upload a clear photo of your plant's affected area. AI will diagnose diseases, deficiencies, and pests with treatment plans.
        </p>

        {/* Upload zone */}
        {!image && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); loadFile(e.dataTransfer.files[0]) }}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--green-600)' : 'var(--green-400)'}`,
              borderRadius: 16, background: dragOver ? 'var(--green-200)' : 'var(--green-100)',
              padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
            }}>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--green-900)' }}>Drop your crop photo here</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>or click to browse · JPG, PNG, WEBP supported</p>
          </div>
        )}

        {/* Preview */}
        {image && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: 'white' }}>
            <img src={image.src} alt="Crop preview" style={{ width: '100%', maxHeight: 320, objectFit: 'contain', background: 'var(--cream)' }} />
            <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
              <button onClick={analyze} disabled={loading}
                style={{ flex: 1, background: loading ? 'var(--cream-dark)' : 'var(--green-700)', color: loading ? 'var(--text-muted)' : 'white', border: 'none', borderRadius: 8, padding: '0.85rem', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Analyzing…' : 'Analyze Crop'}
              </button>
              <button onClick={clear}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '0.85rem 1.25rem', fontFamily: 'inherit', fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2.5rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analyzing your crop image with AI…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'var(--red-100)', border: '1px solid #fca5a5', borderRadius: 10, padding: '1rem 1.25rem', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--red-500)' }}>
            {error}
          </div>
        )}

        {/* Result */}
        {result && (() => {
          const s = statusStyle[result.status] || statusStyle.uncertain
          return (
            <div style={{ marginTop: '1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', borderLeft: `4px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{result.condition || 'Analysis Complete'}</h3>
              </div>
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  {[['Crop Type', result.crop_type], ['Status', result.status?.replace('_', ' ')], ['Severity', result.severity], ['Confidence', result.confidence]].map(([label, val]) => (
                    <div key={label} style={{ background: 'var(--cream)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{val || '—'}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>{result.summary}</p>
                {result.treatment && (
                  <div style={{ background: 'var(--green-100)', borderRadius: 8, padding: '1rem', marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green-800)', display: 'block', marginBottom: '0.4rem' }}>Treatment</strong>
                    <p style={{ fontSize: '0.875rem', color: 'var(--green-900)', lineHeight: 1.7 }}>{result.treatment}</p>
                  </div>
                )}
                {result.prevention && (
                  <div style={{ background: 'var(--amber-100)', borderRadius: 8, padding: '1rem' }}>
                    <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--amber-500)', display: 'block', marginBottom: '0.4rem' }}>Prevention</strong>
                    <p style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: 1.7 }}>{result.prevention}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </div>
    </>
  )
}
