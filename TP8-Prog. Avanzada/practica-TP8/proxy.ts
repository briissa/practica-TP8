import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { randomUUID } from 'node:crypto'
import {
  assignVariant,
  COOKIE,
  INTERNAL_CRAWLER_HEADER,
  INTERNAL_PREVIEW_HEADER,
  INTERNAL_VARIANT_HEADER,
  isVariant,
  isVisitorId,
  SESSION_WINDOW,
  THIRTY_DAYS,
  cookieOptions,
} from '@/lib/experiment'
import { recordImpression } from '@/lib/database'

const CRAWLER_USER_AGENT = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|ia_archiver/i

export async function proxy(request: NextRequest) {
  if (request.method !== 'GET') return NextResponse.next()

  const preview = request.nextUrl.searchParams.get('preview')
  const isPreview = isVariant(preview)
  const isCrawler = CRAWLER_USER_AGENT.test(request.headers.get('user-agent') ?? '')
  const secure = request.nextUrl.protocol === 'https:'
  const requestHeaders = new Headers(request.headers)

  requestHeaders.delete(INTERNAL_CRAWLER_HEADER)
  requestHeaders.delete(INTERNAL_PREVIEW_HEADER)
  requestHeaders.delete(INTERNAL_VARIANT_HEADER)
  requestHeaders.set(INTERNAL_PREVIEW_HEADER, isPreview ? '1' : '0')
  requestHeaders.set(INTERNAL_CRAWLER_HEADER, isCrawler ? '1' : '0')

  if (isPreview) {
    requestHeaders.set(INTERNAL_VARIANT_HEADER, preview)
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set('Cache-Control', 'private, no-store, max-age=0')
    return response
  }

  if (isCrawler) {
    requestHeaders.set(INTERNAL_VARIANT_HEADER, 'a')
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set('Cache-Control', 'private, no-store, max-age=0')
    return response
  }

  const storedVisitorId = request.cookies.get(COOKIE.visitor)?.value
  const visitorId = isVisitorId(storedVisitorId) ? storedVisitorId : randomUUID()
  const variant = assignVariant(visitorId)
  const storedSessionId = request.cookies.get(COOKIE.session)?.value
  const sessionId = isVisitorId(storedSessionId) ? storedSessionId : randomUUID()

  request.cookies.set(COOKIE.visitor, visitorId)
  request.cookies.set(COOKIE.variant, variant)
  request.cookies.set(COOKIE.session, sessionId)
  requestHeaders.set('cookie', request.cookies.toString())
  requestHeaders.set(INTERNAL_VARIANT_HEADER, variant)

  await recordImpression(visitorId, variant, sessionId)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.cookies.set(COOKIE.visitor, visitorId, cookieOptions(secure, THIRTY_DAYS))
  response.cookies.set(COOKIE.variant, variant, cookieOptions(secure, THIRTY_DAYS))
  response.cookies.set(COOKIE.session, sessionId, cookieOptions(secure, SESSION_WINDOW))

  return response
}

export const config = {
  matcher: ['/practica'],
}
