import { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  metadataBase: new URL('https://techgetafrica.com'),
  title: {
    default: 'Techgetafrica - Empowering Tech Education and Innovation by providing affordable and accessible tech education to Africans',
    template: '%s | Techgetafrica'
  },
  description: 'TechGet Africa is a leading platform for tech education, cloud computing training, and career development in Africa. Join our community of learners, educators, and tech professionals.',
  keywords: [
    'tech education',
    'cloud computing',
    'AWS training',
    'Azure training',
    'tech careers',
    'African tech',
    'tech community',
    'tech innovation',
    'tech skills',
    'tech certification',
    'edtech',
    'Africa',
    'techgetafrica',
    'tech courses',

  ],
  authors: [{ name: 'Techgetafrica' }],
  creator: 'Techgetafrica',
  publisher: 'Techgetafrica',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://techgetafrica.com',
    siteName: 'Techgetafrica',
    title: 'Techgetafrica - Empowering Tech Education and Innovation through affordable and accessible tech education to Africans',
    description: 'Join Africa\'s leading tech education platform for cloud computing, career development, and innovation.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TechGet Africa Platform Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechGet Africa - Empowering Tech Education and Innovation',
    description: 'Join Africa\'s leading tech education platform for cloud computing, career development, and innovation.',
    images: ['/images/twitter-image.jpg'],
    creator: '@techgetafrica'
  },
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
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
    yahoo: 'your-yahoo-verification',
  },
  alternates: {
    canonical: 'https://techgetafrica.com',
    languages: {
      'en-US': 'https://techgetafrica.com',
      'fr-FR': 'https://techgetafrica.com/fr',
    },
  },
}; 