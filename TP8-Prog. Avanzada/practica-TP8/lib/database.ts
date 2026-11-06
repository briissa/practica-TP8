import { neon } from '@neondatabase/serverless'
import {
  emptyLog,
  isVariant,
  type ExperimentLog,
  type Variant,
} from '@/lib/experiment'

function getDatabase() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('Falta DATABASE_URL. Configurá la conexión PostgreSQL antes de usar la bitácora.')
  }

  return neon(connectionString)
}

export async function recordImpression(
  visitorId: string,
  variant: Variant,
  sessionId: string,
): Promise<boolean> {
  const sql = getDatabase()
  const rows = await sql`
    INSERT INTO experiment_events (visitor_id, variant, event_type, session_id)
    VALUES (${visitorId}, ${variant}, 'impression', ${sessionId})
    ON CONFLICT DO NOTHING
    RETURNING id
  `

  return rows.length > 0
}

export async function recordConversion(visitorId: string, variant: Variant): Promise<boolean> {
  const sql = getDatabase()
  const rows = await sql`
    INSERT INTO experiment_events (visitor_id, variant, event_type)
    VALUES (${visitorId}, ${variant}, 'conversion')
    ON CONFLICT DO NOTHING
    RETURNING id
  `

  return rows.length > 0
}

export async function getExperimentLog(): Promise<ExperimentLog> {
  const sql = getDatabase()
  const rows = await sql`
    SELECT variant, event_type, COUNT(*)::integer AS count
    FROM experiment_events
    GROUP BY variant, event_type
  `
  const log = emptyLog()

  for (const row of rows) {
    if (!isVariant(row.variant) || typeof row.count !== 'number' || !Number.isSafeInteger(row.count) || row.count < 0) {
      throw new Error('La base devolvió un conteo de eventos inválido.')
    }

    if (row.event_type === 'impression') {
      log[row.variant].impressions = row.count
    } else if (row.event_type === 'conversion') {
      log[row.variant].conversions = row.count
    } else {
      throw new Error('La base devolvió un tipo de evento desconocido.')
    }
  }

  return log
}
