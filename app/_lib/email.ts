import { Resend } from 'resend'

// When using onboarding@resend.dev (no custom domain), Resend only delivers
// to the account owner's email. Use a verified domain to reach all admins.
const ADMIN_EMAILS =
  (process.env.RESEND_FROM ?? '').includes('resend.dev')
    ? ['sanpedrobeach9@gmail.com']
    : ['jasontyw@hotmail.com', 'sanpedrobeach9@gmail.com']

export async function sendEnquiryNotification(enquiry: {
  name: string
  email: string
  contactNumber: string
  country: string
  message: string
  submittedAt: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email.')
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden">
      <div style="background:#7c3aed;padding:24px 32px">
        <h1 style="color:white;margin:0;font-size:20px">New Enquiry — ChinaUni</h1>
      </div>
      <div style="padding:32px;background:#fff">
        <p style="color:#52525b;margin-top:0">A new student enquiry was submitted on <strong>${enquiry.submittedAt}</strong>.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;color:#71717a;width:140px;font-size:14px">Name</td>
            <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-weight:600;font-size:14px">${enquiry.name}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;color:#71717a;font-size:14px">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-size:14px"><a href="mailto:${enquiry.email}" style="color:#7c3aed">${enquiry.email}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;color:#71717a;font-size:14px">Contact</td>
            <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-size:14px">${enquiry.contactNumber || '—'}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;color:#71717a;font-size:14px">Country</td>
            <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-size:14px">${enquiry.country}</td>
          </tr>
          ${enquiry.message ? `
          <tr>
            <td style="padding:10px 0;color:#71717a;font-size:14px;vertical-align:top">Message</td>
            <td style="padding:10px 0;font-size:14px">${enquiry.message.replace(/\n/g, '<br>')}</td>
          </tr>` : ''}
        </table>
        <p style="margin-top:24px;font-size:13px;color:#a1a1aa">This notification was sent to all ChinaUni admin staff.</p>
      </div>
    </div>
  `

  const text = [
    `New ChinaUni enquiry — ${enquiry.submittedAt}`,
    '',
    `Name:    ${enquiry.name}`,
    `Email:   ${enquiry.email}`,
    `Contact: ${enquiry.contactNumber || '—'}`,
    `Country: ${enquiry.country}`,
    enquiry.message ? `\nMessage:\n${enquiry.message}` : '',
  ].join('\n')

  await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'ChinaUni <onboarding@resend.dev>',
    to: ADMIN_EMAILS,
    subject: `New enquiry from ${enquiry.name} (${enquiry.country})`,
    text,
    html,
  })
}
