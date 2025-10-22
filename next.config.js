const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // X-XSS-Protection is deprecated and removed (modern browsers use CSP instead)
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // Content Security Policy - Protects against XSS and unauthorized resource loading
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: only allow resources from same origin
              "default-src 'self'",
              // Scripts: allow same origin, inline scripts (required by Next.js), and Vercel Analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              // Styles: allow same origin and inline styles (required by Tailwind CSS and Next.js)
              "style-src 'self' 'unsafe-inline'",
              // Images: allow same origin, data URIs, blob URIs, Supabase CDN, and Vercel
              "img-src 'self' data: blob: https://*.supabase.co https://stayfocus-alpha.vercel.app",
              // API connections: allow same origin, Supabase API, and Vercel Analytics
              "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com wss://*.supabase.co",
              // Fonts: allow same origin and data URIs
              "font-src 'self' data:",
              // Prevent embedding in iframes (clickjacking protection)
              "frame-ancestors 'none'",
              // Prevent base tag injection attacks
              "base-uri 'self'",
              // Only allow form submissions to same origin
              "form-action 'self'",
              // Upgrade insecure requests to HTTPS
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // Cross-Origin-Opener-Policy: Isolate browsing context (protects against Spectre-like attacks)
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          // Cross-Origin-Resource-Policy: Prevent other origins from loading resources
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          }
        ],
      },
    ]
  },

  // Image optimization
  images: {
    domains: ['stayfocus-alpha.vercel.app'],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Power by header removal
  poweredByHeader: false,
}

module.exports = withBundleAnalyzer(nextConfig)
