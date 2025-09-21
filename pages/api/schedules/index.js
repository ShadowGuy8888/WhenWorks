// REST: GET (list), POST (create)
import pool from '../../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendMailFromUser } from '../../../lib/gmail';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // list schedules for signed-in user (basic)
    const userEmail = req.query.email;
    if (!userEmail) return res.status(400).json({ message: 'email required' });
    const [rows] = await pool.query('SELECT s.* FROM schedules s JOIN users u ON s.owner_id = u.id WHERE u.email = ?', [userEmail]);
    return res.json(rows);

  } else if (req.method === 'POST') {
    // Create schedule (persistent)
    const { ownerEmail, title, friendMode, friendGoogleEmail, friendName, friendLocation, frequency } = req.body;
    let newScheduleId;
    if (!title) 
      return res.status(400).json({ message: 'All fields are required' });
    // Validate owner exists
    const [ownerRows] = await pool.query('SELECT * FROM users WHERE email = ?', [ownerEmail]);
    if (!ownerRows || ownerRows.length === 0) 
      return res.status(403).json({ message: 'owner must be signed in' });
    const owner = ownerRows[0];
    // If friend selected by google account, try to link
    if (friendMode === 'account' && friendGoogleEmail) {
      const [frows] = await pool.query('SELECT * FROM users WHERE email = ?', [friendGoogleEmail]);
      
      if (frows && frows.length) {
        const [result] = await pool.query('INSERT INTO schedules (owner_id, title, frequency) VALUES (?, ?, ?)', [owner.id, title, frequency || 'one-off']);
        newScheduleId = result.insertId;
        const friend = frows[0];
        await pool.query('INSERT INTO schedule_participants (schedule_id, user_id, role) VALUES (?, ?, ?)', [newScheduleId, friend.id, 'editor']);
        // create share token
        const token = uuidv4();
        await pool.query('INSERT INTO share_tokens (schedule_id, token, role) VALUES (?, ?, ?)', [newScheduleId, token, 'editor']);
        // send gmail invite from owner to friend using owner's gmail token
        try {
          const shareLink = `${process.env.NEXTAUTH_URL}/schedule/${newScheduleId}?share=${token}`;
          const html = `<p>Hi ${friend.name || ''},</p><p>${owner.name || owner.email} invited you to collaborate on a WhenWorks schedule. Open: <a href="${shareLink}">${shareLink}</a></p>`;
          await sendMailFromUser(owner, `Invitation to WhenWorks schedule: ${title}`, html, friend.email);

        } catch (err) {
          console.error('invite email failed', err.message);
        }
        
      } else {
        // friend not an account — fallback (shouldn't happen on frontend)
        return res.status(404).json({ message: "Friend's email cannot be found." });
      }
      
    } else {
      // friend_mode = 'manual' → just create participant with provided name/email
      if (friendName) {
        const [result] = await pool.query('INSERT INTO schedules (owner_id, title, frequency) VALUES (?, ?, ?)', [owner.id, title, frequency || 'one-off']);
        newScheduleId = result.insertId;
        await pool.query('INSERT INTO schedule_participants (schedule_id, name, location, role) VALUES (?, ?, ?, ?)',
          [newScheduleId, friendName, friendLocation || null, 'editor']);
      } else 
          return res.status(400).json({ message: "All fields are required." });
    }
    const [schedRows] = await pool.query('SELECT * FROM schedules WHERE id = ?', [newScheduleId]);
    return res.status(201).json(schedRows[0]);

  } else {
    res.setHeader('Allow', 'GET,POST');
    return res.status(405).end('Method Not Allowed');
  }
}
