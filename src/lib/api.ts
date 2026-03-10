// Base URL for all auth/user API calls.
// Set NEXT_PUBLIC_API_BASE_URL in .env — falls back to production if not set.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://blues-clues-hris-backend-frontend-mobile-production.up.railway.app/api/tribeX/auth/v1";
