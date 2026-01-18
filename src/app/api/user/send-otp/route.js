import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

export async function POST(req) {
  try {
    const { mobile } = await req.json();
    const otp = '12345'; // TEMP OTP

    if (!mobile) {
      return NextResponse.json({ success: false, message: 'Mobile required' });
    }

    const [rows] = await pool.query(
      'SELECT id FROM users WHERE mobile = ?',
      [mobile]
    );

    if (rows.length === 0) {
      // 🔥 New user
      await pool.query(
        `INSERT INTO users (mobile, otp, verified, status)
         VALUES (?, ?, 0, 'active')`,
        [mobile, otp]
      );
    } else {
      // 🔥 Existing user → update OTP
      await pool.query(
        'UPDATE users SET otp = ?, verified = 0 WHERE mobile = ?',
        [otp, mobile]
      );
    }

    // 📲 SMS API will go here later
    console.log('OTP set for', mobile, otp);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
