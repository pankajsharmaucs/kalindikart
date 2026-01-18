import { NextResponse } from 'next/server';
import { pool } from '../db.js';

export async function POST(req) {
  try {
    const {
      fullname,
      email,
      mobile,
      line1,
      line2,
      line3,
      pincode,
      landmark,
    } = await req.json();

    if (!fullname || !mobile || !line1 || !pincode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE mobile = ? LIMIT 1',
      [mobile]
    );

    if (existing.length) {
      // 🔄 UPDATE
      await pool.query(
        `UPDATE users SET
          fullname = ?,
          email = ?,
          address_line1 = ?,
          address_line2 = ?,
          address_line3 = ?,
          pincode = ?,
          landmark = ?
         WHERE mobile = ?`,
        [
          fullname,
          email,
          line1,
          line2,
          line3,
          pincode,
          landmark,
          mobile,
        ]
      );
    } else {
      // ➕ INSERT (new user)
      await pool.query(
        `INSERT INTO users
          (fullname, email, mobile, address_line1, address_line2, address_line3, pincode, landmark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullname,
          email,
          mobile,
          line1,
          line2,
          line3,
          pincode,
          landmark,
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('SAVE CHECKOUT ADDRESS ERROR:', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
