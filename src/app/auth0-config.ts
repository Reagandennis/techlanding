// auth0-config.ts

export const auth0 = initAuth0({
  baseURL: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
});

function initAuth0(arg0: { baseURL: string; issuerBaseURL: string | undefined; clientID: string | undefined; clientSecret: string | undefined; secret: string | undefined; routes: { callback: string; login: string; logout: string; }; }) {
  throw new Error("Function not implemented.");
}
