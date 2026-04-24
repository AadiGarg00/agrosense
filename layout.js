import './globals.css'

export const metadata = {
  title: 'AgroSense – Smart Agriculture Platform',
  description: 'AI-powered crop scanning, weather intelligence, and soil monitoring for modern farmers.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream font-sans text-green-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}
