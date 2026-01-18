import { NextResponse } from 'next/server';
import { pool } from '../../db.js'; // adjust relative path to your db.js

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      fullname,
      email,
      mobile,
      line1,
      line2,
      line3,
      pincode,
      landmark,
    } = body;

    if (!fullname || !mobile || !line1 || !pincode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE mobile = ?',
      [mobile]
    );

    if (!existingUser.length) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update address
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
      [fullname, email, line1, line2, line3, pincode, landmark, mobile]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Checkout API error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
