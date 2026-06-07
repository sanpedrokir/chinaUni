import { sql } from '../../../../_lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rows = await sql`
    SELECT id, role, content
    FROM messages
    WHERE conversation_id = ${id}
      AND role IN ('user', 'assistant')
    ORDER BY created_at ASC
  `
  return NextResponse.json(rows)
}
