/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  
  // Application Settings
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_MOCK_DATA: string
  
  // Multi-tenant Configuration
  readonly VITE_TENANT_MODE: string
  readonly VITE_DEFAULT_TENANT: string
  
  // Authentication
  readonly VITE_TOKEN_REFRESH_INTERVAL: string
  readonly VITE_SESSION_TIMEOUT: string
  
  // Localization
  readonly VITE_DEFAULT_LOCALE: string
  readonly VITE_SUPPORTED_LOCALES: string
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_BILLING: string
  readonly VITE_ENABLE_ADVANCED_REPORTING: string
  
  // Development Settings
  readonly VITE_ENABLE_DEV_TOOLS: string
  readonly VITE_LOG_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
