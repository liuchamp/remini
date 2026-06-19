export const GLOBAL_CONFIG = {
  API_BASE_URL: process.env.TARO_APP_API_URL || 'https://api.remx.com',
  DEFAULT_PAGE_SIZE: 20,
  REQUEST_TIMEOUT: 10000,
} as const;