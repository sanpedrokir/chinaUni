import { neon } from '@neondatabase/serverless'

let cachedSql: any
function getSql() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured.')
  }

  if (!cachedSql) {
    cachedSql = neon(databaseUrl)
  }

  return cachedSql
}

export const sql = (...args: any[]) => {
  return getSql()(...args)
}
