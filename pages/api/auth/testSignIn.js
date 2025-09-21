import { getToken } from 'next-auth/jwt';
import { setCookie } from 'cookies-next';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  // WARNING: In a real app, you should restrict this endpoint to only run in 
  // development or CI environments (e.g., check process.env.NODE_ENV).
  // For demo purposes, we'll keep it simple.

  // 1. Get the user email from the request query string
  const { email } = req.query;

  // 2. Use Next-Auth's getToken to create a valid session token for this user
  const token = await getToken({
    req,
    secret,
    signingKey: process.env.NEXTAUTH_SECRET,
    // Mock a user object that matches your session structure
    user: {
      name: 'Test User',
      email: email,
      image: null,
    },
  });

  // 3. Set the next-auth.session-token cookie directly on the response
  setCookie('next-auth.session-token', token, { req, res, maxAge: 60 * 60 * 24 * 30 }); // 30 days

  // 4. Redirect to the homepage or any other page after "sign in"
  res.redirect('/');
}