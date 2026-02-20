import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    const [rows] = await pool.query(
      'SELECT id, email FROM users WHERE email = ? AND otp = ?',
      [email, otp]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' });
    }

    await pool.query(
      'UPDATE users SET otp = NULL, verified = 1 WHERE email = ?',
      [email]
    );

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}