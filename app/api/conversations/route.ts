import { sql } from '../../_lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { mode } = await req.json()
  const title = mode === 'agent' ? 'Agent Session' : 'Chat Session'
  const rows = await sql`
    INSERT INTO conversations (mode, title)
    VALUES (${mode}, ${title})
    RETURNING id
  `
  return NextResponse.json({ id: rows[0].id })
}
