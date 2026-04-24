'use client'
import { useState, useRef, useEffect } from 'react'
import Navbar from '../../components/Navbar'

const SYSTEM_GREETING = "Hello! I'm your AgroSense AI assistant. I can help with crop diseases, soil health, irrigation scheduling, pest management, and more. What would you like to know today?"

const CHIPS = [
  'Best time to irrigate wheat?',
  'Yellow leaves on tomato plants',
  'How to improve soil pH?',
  'Organic pest control methods',
]

export default function ChatPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: SYSTEM_GREETING }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chipsVisible, setChipsVisible] = useState(true)
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function send(text) {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')
    setChipsVisible(false)
    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally { setLoading(false) }
  }

  function getTime() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>🧑‍🌾 Expert AI Assistant</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ask anything about farming, crop diseases, soil health, irrigation, and more.</p>
        </div>

        {/* Messages */}
        <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem', marginBottom: '0.75rem', minHeight: 0 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.25rem', maxWidth: '85%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                padding: '0.75rem 1rem', borderRadius: 12, fontSize: '0.9rem', lineHeight: 1.6,
                background: m.role === 'user' ? 'var(--green-700)' : 'white',
                color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                borderBottomRightRadius: m.role === 'user' ? 4 : 12,
                borderBottomLeftRadius: m.role === 'bot' ? 4 : 12,
                whiteSpace: 'pre-wrap',
              }}>{m.content}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{getTime()}</div>
            </div>
          ))}

          {/* Thinking indicator */}
          {loading && (
            <div style={{ alignSelf: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: 12, width: 'fit-content' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="thinking-dot" style={{ width: 7, height: 7, background: 'var(--green-400)', borderRadius: '50%', display: 'block' }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick chips */}
        {chipsVisible && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {CHIPS.map(chip => (
              <button key={chip} onClick={() => send(chip)}
                style={{ background: 'var(--green-100)', border: '1px solid var(--green-300)', color: 'var(--green-800)', fontSize: '0.78rem', fontWeight: 500, padding: '0.35rem 0.75rem', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}>
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask your farming question…"
            style={{ flex: 1, padding: '0.85rem 1rem', border: '1px solid var(--border)', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.95rem', background: 'white', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            style={{ background: loading ? 'var(--cream-dark)' : 'var(--green-700)', color: 'white', border: 'none', borderRadius: 10, padding: '0.85rem 1.25rem', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
            ➤
          </button>
        </div>
      </div>
    </>
  )
}
