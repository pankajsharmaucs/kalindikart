import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

/* ===============================
    GET – ALL users
================================ */
export async function GET() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * FROM users ORDER BY created_at DESC`
    );

    // Return all users as an array
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET ALL users ERROR:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  } finally {
    connection.release();
  }
}