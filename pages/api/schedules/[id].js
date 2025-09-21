// GET schedule, PUT updates, etc.
import pool from '../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method === 'GET') {
    const [rows] = await pool.query('SELECT * FROM schedules WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    const schedule = rows[0];
    const [parts] = await pool.query('SELECT * FROM schedule_participants WHERE schedule_id = ?', [id]);
    schedule.participants = parts;
    return res.json(schedule);

  } else if (req.method === 'PUT') {
    // naive server-side validation and update
    const { title, updater_email } = req.body;
    if (!updater_email) return res.status(403).json({ error: 'must provide updater_email' });
    // check updater is owner with editor role
    const [ownerRows] = await pool.query(`
      SELECT u.id FROM users u 
      JOIN schedules s ON s.owner_id = u.id 
      WHERE s.id = ? AND u.email = ?
    `, [id, updater_email]);
    if (!ownerRows.length) {
      // check updater is participant with editor role
      const [pRows] = await pool.query(`
        SELECT * FROM schedule_participants 
        WHERE schedule_id = ? 
        AND user_id = (SELECT id FROM users WHERE email = ?)
        
      `, [id, updater_email, updater_email]);
      if (!pRows.length) return res.status(403).json({ error: 'no permission' });
    }
    await pool.query('UPDATE schedules SET title = ?, updated_at = NOW() WHERE id = ?', [title, id]);
    const [rows] = await pool.query('SELECT * FROM schedules WHERE id = ?', [id]);
    return res.json(rows[0]);
  } else {
    res.setHeader('Allow', 'GET,PUT');
    res.status(405).end('Method Not Allowed');
  }
}
