import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LinKo — Learn Korean with YouTube',
  description: 'Master Korean with your favorite YouTube videos. One click to create Korean learning materials.',
  twitter: {
    card: 'summary_large_image',
    title: 'LinKo — Learn Korean with YouTube',
    description: 'Master Korean with your favorite YouTube videos. One click to create Korean learning materials.',
  },
  openGraph: {
    title: 'LinKo — Learn Korean with YouTube',
    description: 'Master Korean with your favorite YouTube videos. One click to create Korean learning materials.',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'LinKo — Learn Korean with YouTube',
      },
    ],
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
