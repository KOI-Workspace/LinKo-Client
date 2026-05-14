import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'LinKo | Learn Korean with YouTube videos',
  description: 'Master Korean with your favorite YouTube videos. One click to create Korean learning materials.',
  twitter: {
    card: 'summary_large_image',
    title: 'LinKo | Learn Korean with YouTube videos',
    description: 'Master Korean with your favorite YouTube videos. One click to create Korean learning materials.',
  },
  openGraph: {
    title: 'LinKo | Learn Korean with YouTube videos',
    description: 'Master Korean with your favorite YouTube videos. One click to create Korean learning materials.',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'LinKo | Learn Korean with YouTube videos',
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
      <head>
        {/* Meta 픽셀 */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1428240336010336');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display:'none'}}
            src="https://www.facebook.com/tr?id=1428240336010336&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  )
}
