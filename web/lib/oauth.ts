export function getGoogleOAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '602064877944-dluafa255opf8sns4i7imqov0h40rcr2.apps.googleusercontent.com';
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    'http://localhost:8081/oauth/google/callback';
  const base = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile https://mail.google.com/',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `${base}?${params.toString()}`;
}
