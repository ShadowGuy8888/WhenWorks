# WhenWorks — Starter Full-Stack App
This repository is a **production-oriented starter** implementing the core WhenWorks features you described:
- Google Sign-In (NextAuth) with tokens saved in MySQL
- Send Gmail invites from the *user's* Gmail account via OAuth2 (Gmail API)
- Temporary guest schedules saved to localStorage (auto-save)
- Persistent schedules stored in MySQL (auto-save)
- Live collaborative editing using Socket.IO
- Notification worker outline (node-cron) to send 10-min-before emails
- MySQL schema (see `sql/schema.sql`)
- Playwright end-to-end test skeleton
- GitHub Actions workflow for tests and deploy guidance

> **Important**: This is an opinionated, well-documented, secure starting point. You will need to create Google Cloud credentials and set environment variables (instructions below).

---

## Files included
- `package.json` — scripts and deps
- `next.config.js`
- `pages/` — Next.js pages (dashboard, schedule editor)
- `pages/api/auth/[...nextauth].js` — NextAuth configuration
- `pages/api/schedules/*.js` — REST API for schedules
- `server/socketServer.js` — separate Socket.IO server
- `lib/db.js` — mysql2 pool helper (uses env vars)
- `lib/gmail.js` — helper to send gmail using googleapis & stored tokens
- `sql/schema.sql` — complete CREATE TABLE statements
- `playwright/` — Playwright tests skeleton
- `.github/workflows/ci.yml` — CI to run tests and lint
- `README.md` — this file

---

## Quick start (local)
1. Install dependencies:
```bash
cd whenworks_starter
npm install
```

2. Create a `.env.local` (see `.env.example` in repo). Minimum env vars:
```
DATABASE_URL=mysql://user:pass@localhost:3306/whenworks
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=supersecure_long_random
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GMAIL_OAUTH_CLIENT_ID=...   # typically same as GOOGLE_CLIENT_ID
GMAIL_OAUTH_CLIENT_SECRET=...
SESSION_SECRET=...
SOCKET_IO_PORT=4000
```

3. Run the MySQL schema:
```bash
# using mysql client
mysql -u root -p whenworks < sql/schema.sql
```

4. Start servers (two processes):
```bash
# start socket server
node server/socketServer.js &

# start Next.js
npm run dev
```

5. Open http://localhost:3000

---

## Google Cloud / Gmail OAuth step-by-step (short)
Follow these steps to obtain credentials required for Google sign-in and to send Gmail on behalf of users.

1. Go to Google Cloud Console → APIs & Services → Credentials.
2. Create a new project (or re-use one).
3. OAuth consent screen: configure an internal or external app, add scopes:
   - `openid`, `profile`, `email`
   - `https://www.googleapis.com/auth/gmail.send` (required to send mail)
4. Create OAuth 2.0 Client ID (Web application). Allowed redirect URIs must include:
   - `http://localhost:3000/api/auth/callback/google` (for dev)
5. Save **Client ID** and **Client Secret** into `.env.local` (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).
6. Enable **Gmail API** on the project (APIs & Services → Library → Gmail API → Enable).

For detailed authoritative docs see:
- NextAuth Google provider notes about refresh token behavior. citeturn0search0
- Gmail API sending guide (raw base64 messages). citeturn0search1
- Google OAuth setup docs. citeturn0search12turn0search2

---

## How "send from user's Gmail" works (short)
1. At sign-in we request `https://www.googleapis.com/auth/gmail.send`.
2. NextAuth receives `accessToken` and `refreshToken` (first sign-in).
3. We **save** the refreshToken server-side (MySQL) encrypted.
4. When creating a schedule and inviting a friend, our server uses the user's refresh token + client credentials to get a fresh access token and call `gmail.users.messages.send` with a base64url-encoded RFC2822 message (see `lib/gmail.js`). Official docs: Gmail send. citeturn0search1

> Note: Google only issues a refresh token the first time the user consents unless you force re-consent. See NextAuth notes. citeturn0search0

---

## Deployment & CI/CD (recommended)
- Host the Next.js frontend on Vercel (fast, serverless).
- Host the Socket.IO + cron worker on a container (Cloud Run, Render, or a small VM) because serverless functions struggle with sockets.
- Use GitHub Actions to run tests (Playwright) and to deploy (Vercel supports GitHub Actions). Example guidance: deploy to Vercel via GitHub Actions. citeturn0search13turn0search3

A sample GitHub Actions workflow is included under `.github/workflows/ci.yml`.

---

## Security & anti-tampering notes (what's implemented)
- Server-side validation for all schedule updates (owner/participant checks).
- Parameterized SQL queries (mysql2 prepared statements).
- Rate limit endpoint for share-link/email sending (simple in-memory limiter).
- Share links are single UUIDs with expiry stored in DB.
- Temporary schedules live in `localStorage` for guest sessions only (cleared after sign-in).
- Never accept arbitrary `from` emails — invites are sent using the signed-in user's Gmail.

---

## Next steps / future work
- Add Web Push for browser notifications (requires service worker / push subscription).
- Add third-party Realtime provider (Pusher, Ably) for easier scaling.
- Multi-participant schedule editor + conflict detection UI.
- GDPR / data export flows.

---

Thanks! The code bundle below has working examples and detailed comments inline.
