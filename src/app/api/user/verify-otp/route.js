import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '../../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function POST(req) {
  try {
    const { mobile, otp } = await req.json();

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE mobile = ? AND otp = ?',
      [mobile, otp]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false });
    }

    const user = rows[0];

    await pool.query(
      'UPDATE users SET otp = NULL, verified = 1 WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
