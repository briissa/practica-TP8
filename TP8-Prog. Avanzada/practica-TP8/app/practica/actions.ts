'use server'

import { cookies, headers } from 'next/headers'
import { recordConversion as saveConversion } from '@/lib/database'
import { assignVariant, COOKIE, isVariant, isVisitorId } from '@/lib/experiment'

export type ConversionResult =
  | { status: 'recorded' }
  | { status: 'already_recorded' }
  | { status: 'preview' }

export async function recordConversion(): Promise<ConversionResult> {
  const requestHeaders = await headers()
  const referer = requestHeaders.get('referer')

  if (referer) {
    const refererUrl = new URL(referer)
    if (isVariant(refererUrl.searchParams.get('preview'))) return { status: 'preview' }
  }

  const cookieStore = await cookies()
  const visitorId = cookieStore.get(COOKIE.visitor)?.value
  const storedVariant = cookieStore.get(COOKIE.variant)?.value

  if (!isVisitorId(visitorId)) {
    throw new Error('No hay un visitante asignado. Volvé a cargar /practica antes de reservar.')
  }

  const variant = assignVariant(visitorId)
  if (!isVariant(storedVariant) || storedVariant !== variant) {
    throw new Error('La variante guardada no coincide con la asignación del visitante.')
  }

  const recorded = await saveConversion(visitorId, variant)
  return { status: recorded ? 'recorded' : 'already_recorded' }
}
