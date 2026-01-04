import { z } from "zod"

// Environment variable validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  MEDICAL_AI_API_KEY: z.string().optional(),
  MEDICAL_AI_BASE_URL: z.string().url().optional(),

  // File Upload
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_NAME: z.string().default("MediTrack AI"),

  // Security
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),

  // Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Analytics
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  MIXPANEL_TOKEN: z.string().optional(),

  // Feature Flags
  ENABLE_AI_ANALYSIS: z.string().default("true"),
  ENABLE_VOICE_SUMMARY: z.string().default("true"),
  ENABLE_NOTIFICATIONS: z.string().default("true"),
  ENABLE_EXPORT: z.string().default("true"),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().default("100"),
  RATE_LIMIT_WINDOW: z.string().default("900000"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  SENTRY_DSN: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error("❌ Invalid environment variables:", error)
    process.exit(1)
  }
}
