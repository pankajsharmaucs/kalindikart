import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile');

    if (!mobile) {
      return NextResponse.json(
        { error: 'Mobile is required' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `SELECT 
        fullname,
        email,
        mobile,
        address_line1,
        address_line2,
        address_line3,
        pincode,
        landmark
       FROM users
       WHERE mobile = ?
       LIMIT 1`,
      [mobile]
    );

    if (!rows.length) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      user: rows[0],
    });
  } catch (err) {
    console.error('GET USER BY MOBILE ERROR:', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
