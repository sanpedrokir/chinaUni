import { NextResponse } from 'next/server'
import { sql } from '../../_lib/db'
import { sendEnquiryNotification } from '../../_lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Server database configuration is missing.' },
        { status: 500 }
      )
    }

    const { name, email, contactNumber, country, message } = await req.json()

    if (!name?.trim() || !email?.trim() || !country?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and country are required.' },
        { status: 400 }
      )
    }

    const rows = await sql`
      INSERT INTO enquiries (name, email, contact_number, country, message)
      VALUES (${name.trim()}, ${email.trim()}, ${contactNumber?.trim() ?? null}, ${country.trim()}, ${message?.trim() ?? null})
      RETURNING id, created_at
    `

    const record = rows[0]
    const submittedAt = new Date(record.created_at as string).toLocaleString('en-GB', {
      timeZone: 'Asia/Shanghai',
      dateStyle: 'medium',
      timeStyle: 'short',
    })

    // Fire-and-forget email — don't fail the request if email fails
    sendEnquiryNotification({
      name: name.trim(),
      email: email.trim(),
      contactNumber: contactNumber?.trim() ?? '',
      country: country.trim(),
      message: message?.trim() ?? '',
      submittedAt,
    }).catch((err) => console.error('[email error]', err))

    return NextResponse.json({ id: record.id, ok: true }, { status: 201 })
  } catch (error) {
    console.error('[enquiries error]', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Unable to submit enquiry: ${error.message}`
            : 'Unable to submit enquiry right now. Please try again later.',
      },
      { status: 500 }
    )
  }
}
