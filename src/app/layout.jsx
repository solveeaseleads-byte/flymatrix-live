import './globals.css';

export const metadata = {
  title: 'FlyMatrix — Search Smarter, Compare Travel & Book Flights',
  description: 'Your travel shop for the world. Compare flights, discover top hotel destinations, and secure the best travel deals with FlyMatrix.',
  keywords: ['Travel', 'Search', 'Flight Search', 'FlyMatrix', 'Compare Travel', 'Search Flights', 'Hotel Destinations'],
  authors: [{ name: 'FlyMatrix' }],
  creator: 'FlyMatrix',
  publisher: 'FlyMatrix',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://flymatrix.app',
    title: 'FlyMatrix — Search Smarter & Compare Travel Deals',
    description: 'One shop, multiple deals. Trusted by travelers for flexible flight and hotel bookings.',
    siteName: 'FlyMatrix',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlyMatrix — Search Smarter & Compare Travel Deals',
    description: 'One shop, multiple deals. Trusted by travelers for flexible flight and hotel bookings.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://flymatrix.app" />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
