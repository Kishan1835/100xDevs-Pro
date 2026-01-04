export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL!,
  },

  // Authentication
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL!,
  },

  // AI Services
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY!,
    },
    medical: {
      apiKey: process.env.MEDICAL_AI_API_KEY,
      baseUrl: process.env.MEDICAL_AI_BASE_URL,
    },
  },

  // File Upload
  upload: {
    uploadthing: {
      secret: process.env.UPLOADTHING_SECRET,
      appId: process.env.UPLOADTHING_APP_ID,
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || "us-east-1",
      bucket: process.env.AWS_S3_BUCKET,
    },
  },

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Application
  app: {
    url: process.env.APP_URL || "http://localhost:3000",
    name: process.env.APP_NAME || "MediTrack AI",
    env: process.env.NODE_ENV || "development",
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET!,
    encryptionKey: process.env.ENCRYPTION_KEY!,
  },

  // Payments
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    mixpanelToken: process.env.MIXPANEL_TOKEN,
  },

  // Feature Flags
  features: {
    aiAnalysis: process.env.ENABLE_AI_ANALYSIS === "true",
    voiceSummary: process.env.ENABLE_VOICE_SUMMARY === "true",
    notifications: process.env.ENABLE_NOTIFICATIONS === "true",
    export: process.env.ENABLE_EXPORT === "true",
  },

  // Rate Limiting
  rateLimit: {
    max: Number.parseInt(process.env.RATE_LIMIT_MAX || "100"),
    window: Number.parseInt(process.env.RATE_LIMIT_WINDOW || "900000"),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    sentryDsn: process.env.SENTRY_DSN,
  },
}

// Validation function to check required environment variables
export function validateConfig() {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "JWT_SECRET", "ENCRYPTION_KEY"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}
