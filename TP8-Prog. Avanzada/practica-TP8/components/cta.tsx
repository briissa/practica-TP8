'use client'

import { useState, useTransition } from 'react'
import { recordConversion } from '@/app/practica/actions'

export function Cta({ label, preview = false }: { label: string; preview?: boolean }) {
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={pending || preview}
        onClick={() => {
          startTransition(async () => {
            try {
              const result = await recordConversion()
              setMessage(
                result.status === 'recorded'
                  ? 'Clic registrado como conversión.'
                  : result.status === 'already_recorded'
                    ? 'Este visitante ya tenía una conversión registrada.'
                    : 'El preview no registra conversiones.',
              )
            } catch {
              setMessage('No se pudo registrar la conversión. Revisá la conexión con la base e intentá de nuevo.')
            }
          })
        }}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {label}
      </button>
      <p role="status" className="max-w-md text-sm text-muted-foreground">
        {message ||
          (preview
            ? 'El preview permite revisar el copy, pero no registra eventos.'
            : 'La conversión se anota solo acá. Cargar la página no cuenta.')}
      </p>
    </div>
  )
}
