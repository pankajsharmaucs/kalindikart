import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

export async function POST(req) {
  try {
    const { mobile } = await req.json();

    if (!mobile) {
      return NextResponse.json({ error: 'Mobile required' }, { status: 400 });
    }

    const otp = Math.floor(10000 + Math.random() * 90000); // 5-digit OTP

    // Check user
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE mobile = ?',
      [mobile]
    );

    if (rows.length === 0) {
      // 🔥 Create new user
      await pool.query(
        `INSERT INTO users (mobile, otp, verified, status)
         VALUES (?, ?, 0, 'active')`,
        [mobile, otp]
      );
    } else {
      // 🔥 Update OTP for existing user
      await pool.query(
        'UPDATE users SET otp = ?, verified = 0 WHERE mobile = ?',
        [otp, mobile]
      );
    }

    // ⚠️ Replace this with SMS gateway later
    console.log('OTP for', mobile, otp);

    return NextResponse.json({
      message: 'OTP sent successfully',
      otp, // ❌ remove in production
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'OTP send failed' }, { status: 500 });
  }
}
