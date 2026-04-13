"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

// Placeholder client ID for local development until env is configured.
// Backend team: set up OAuth credentials at https://console.cloud.google.com
// Project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
// Authorized origins: http://localhost:3000 (dev), https://yourdomain.com (prod)
// Authorized redirect URIs: not needed for token-based flow
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "YOUR_GOOGLE_CLIENT_ID";

export function GoogleAuthProvider({ children }: { readonly children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
