import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'chinauni-dev-secret-change-in-production-32chars'
)

const PROTECTED = ['/search', '/chat', '/agent']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  if (!needsAuth) return NextResponse.next()

  const token = req.cookies.get('chinauni_session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/?auth=required', req.url))
  }

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/?auth=required', req.url))
    res.cookies.delete('chinauni_session')
    return res
  }
}

export const config = {
  matcher: ['/search/:path*', '/chat/:path*', '/agent/:path*'],
}
