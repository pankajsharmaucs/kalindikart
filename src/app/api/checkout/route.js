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

    // 1. STRENGTHENED VALIDATION
    // We need at least one identifier (email or mobile) to know WHO this is
    if (!fullname || (!mobile && !email) || !line1 || !pincode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    /* 2. FLEXIBLE LOOKUP 
       Matches the user regardless of if they provided mobile or email.
    */
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE (mobile = ? AND mobile <> "") OR (email = ? AND email <> "") LIMIT 1',
      [mobile || null, email || null]
    );

    if (existing.length > 0) {
      // 🔄 UPDATE: Use the internal 'id' to stay safe
      await pool.query(
        `UPDATE users SET
          fullname = ?,
          email = ?,
          mobile = ?,
          address_line1 = ?,
          address_line2 = ?,
          address_line3 = ?,
          pincode = ?,
          landmark = ?
         WHERE id = ?`,
        [fullname, email, mobile, line1, line2, line3, pincode, landmark, existing[0].id]
      );
    } else {
      // ➕ INSERT: Create new record
      await pool.query(
        `INSERT INTO users
          (fullname, email, mobile, address_line1, address_line2, address_line3, pincode, landmark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [fullname, email, mobile, line1, line2, line3, pincode, landmark]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('SAVE ADDRESS ERROR:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    // This 'userId' comes from your searchParams, e.g., ?userId=9999999999 or ?userId=abc@gmail.com
    const identifier = req.nextUrl.searchParams.get('userId'); 
    
    if (!identifier) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const [rows] = await pool.query(
      `SELECT * FROM users WHERE mobile = ? OR email = ? LIMIT 1`,
      [identifier, identifier]
    );

    if (rows.length === 0) {
      // Return success true but null user so the frontend knows to show an empty form
      return NextResponse.json({ success: true, user: null });
    }

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('GET ADDRESS ERROR:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}