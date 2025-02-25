export const config = {
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
    maxRetries: 5,
    retryDelay: 2000
  },
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'production'
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || ''
  }
}
