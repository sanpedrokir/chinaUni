const fs = require('fs')
const path = require('path')

const config = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM: process.env.RESEND_FROM || '',
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
}

const content =
  'export const RUNTIME_CONFIG: Record<string, string> = ' +
  JSON.stringify(config, null, 2) +
  '\n'

const outPath = path.join(__dirname, '..', 'app', '_lib', 'runtime-config.ts')
fs.writeFileSync(outPath, content)
console.log('[gen-runtime-config] Written to', outPath)
console.log('[gen-runtime-config] DATABASE_URL set:', !!config.DATABASE_URL)
console.log('[gen-runtime-config] OPENAI_API_KEY set:', !!config.OPENAI_API_KEY)
console.log('[gen-runtime-config] SESSION_SECRET set:', !!config.SESSION_SECRET)
