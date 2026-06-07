export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { RUNTIME_CONFIG } = await import('./app/_lib/runtime-config')
    for (const [key, value] of Object.entries(RUNTIME_CONFIG)) {
      if (value && !process.env[key]) {
        process.env[key] = value
      }
    }
  }
}
