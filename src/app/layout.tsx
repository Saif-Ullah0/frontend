// app/layout.tsx - Enhanced EdTech Platform Layout
import './globals.css';
import { ReactNode } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner'; // Better toast library
import { Metadata, Viewport } from 'next';

// Font configurations
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// SEO Metadata
export const metadata: Metadata = {
  title: {
    default: 'EduPlatform - Master Tech Skills That Actually Matter',
    template: '%s | EduPlatform'
  },
  description: 'Learn from industry experts with hands-on courses in web development, data science, AI, and more. Join thousands of successful graduates building their dream careers.',
  keywords: [
    'online learning',
    'web development courses',
    'programming tutorials',
    'tech skills',
    'coding bootcamp',
    'software development',
    'data science',
    'artificial intelligence',
    'career development'
  ],
  authors: [{ name: 'EduPlatform Team' }],
  creator: 'EduPlatform',
  publisher: 'EduPlatform',
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
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'EduPlatform',
    title: 'EduPlatform - Master Tech Skills That Actually Matter',
    description: 'Learn from industry experts with hands-on courses in web development, data science, AI, and more.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EduPlatform - Online Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduPlatform - Master Tech Skills That Actually Matter',
    description: 'Learn from industry experts with hands-on courses in web development, data science, AI, and more.',
    images: ['/og-image.jpg'],
    creator: '@eduplatform',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3b82f6' },
    ],
  },
  // manifest: '/site.webmanifest', // 🔥 Removed to avoid 404
  alternates: {
    canonical: 'https://your-domain.com',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0b14' },
  ],
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body 
        className={`
          min-h-screen
          bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]
          text-white
          font-sans
          antialiased
          selection:bg-blue-500/20
          selection:text-blue-200
        `}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 transition-all"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <div id="global-loading" className="hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="text-white font-medium">Loading...</span>
                </div>
              </div>
            </div>
          </div>

          <header className="sticky top-0 z-40">
            <Navbar />
          </header>

          <main id="main-content" className="flex-1">
            {children}
          </main>

          <Footer />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                color: '#f1f5f9',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />

          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
            <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-[100px] rounded-full animate-pulse-slower"></div>
          </div>
        </AuthProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
