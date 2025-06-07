import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next()

  // Define CSP directives
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com *.gstatic.com *.clarity.ms *.google-analytics.com *.googletagmanager.com *.tiktokcdn.com *.tiktokv.com *.byteintl.com",
    "style-src 'self' 'unsafe-inline' *.googleapis.com *.gstatic.com",
    "img-src 'self' data: blob: https: *.supabase.co *.tiktokcdn.com *.tiktokv.com *.ibyteimg.com",
    "font-src 'self' data: *.googleapis.com *.gstatic.com",
    "frame-src 'self' *.tiktok.com *.bytedance.com",
    "connect-src 'self' blob: data: wss: *.supabase.co *.googleapis.com *.google-analytics.com *.analytics.google.com *.googletagmanager.com *.clarity.ms *.stripe.com *.tiktokv.com *.tiktokv.eu *.tiktok.com *.bytedance.com *.byteintl.com *.byteintl.net *.byteintlapi.com *.byteintlstatic.com *.byteoversea.com *.byteoversea.net *.isnssdk.com *.musical.ly *.tiktokapis.com *.tiktokcdn.com *.tiktokcdn-eu.com *.tiktokcdn-in.com *.tiktokcreativeone.com *.tiktokeu-cdn.com *.tiktokglobalshop.com *.tiktokmusic.me *.tiktokstaticb.com *.tiktokus.info *.tiktokvapp.eu *.tiktokw.eu *.tiktokw.us *.ttlivecdn.com *.ttlstatic.com *.ttwstatic.com *.zhiliaoapp.com *.ibytedtos.com *.ibyteimg.com *.sgsnssdk.com *.topbuzzcdn.com *.vodupload.com libraweb-i18n.tiktok.com mcs-i18n.tiktok.com mon-i18n.tiktokv.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')

  // Set CSP header
  response.headers.set('Content-Security-Policy', cspDirectives)

  // Set other security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 