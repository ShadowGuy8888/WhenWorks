import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import pool from '../../../lib/db';
import mysql from 'mysql2/promise';

const googleScopes = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/gmail.send'
];

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: googleScopes.join(' '),
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) { // account and profile is only truthy when user signs in
      // Persist the OAuth access_token & refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach tokens to session client-side (if needed)
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      // Save or update user record and persist refresh token server-side (encrypted in prod)
      try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [user.email]);
        if (rows.length) {
          // update
          await conn.query(
            'UPDATE users SET google_id = ?, name = ?, gmail_refresh_token = ?, updated_at = NOW() WHERE email = ?',
            [profile.sub, user.name, account.refresh_token || null, user.email]
          );
        } else {
          await conn.query(
            'INSERT INTO users (google_id, email, name, gmail_refresh_token) VALUES (?, ?, ?, ?)',
            [profile.sub, user.email, user.name, account.refresh_token || null]
          );
        }
        conn.release();
      } catch (err) {
        console.error('signIn event error', err);
      }
    }
  }
});
