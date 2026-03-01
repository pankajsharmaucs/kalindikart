import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    // Renamed variable to 'identifier' since it can be email or mobile
    const identifier = searchParams.get('identifier'); 

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier (Mobile or Email) is required' },
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
       WHERE mobile = ? OR LOWER(email) = LOWER(?)
       LIMIT 1`,
      [identifier, identifier]
    );

    if (!rows.length) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      user: rows[0],
    });
  } catch (err) {
    console.error('GET USER ERROR:', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}