import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '../../../_lib/db'
import { createSession, setSessionCookie } from '../../../_lib/auth'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required.' }, { status: 400 })
  }

  const rows = await sql`
    SELECT id, username, email, password_hash
    FROM admin_users
    WHERE username = ${username.trim().toLowerCase()}
    LIMIT 1
  `

  const user = rows[0]
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  }

  const match = await bcrypt.compare(password, user.password_hash as string)
  if (!match) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  }

  const token = await createSession({
    id: user.id as string,
    username: user.username as string,
    email: user.email as string,
  })

  await setSessionCookie(token)

  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email },
  })
}
