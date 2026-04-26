import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier (Mobile or Email) is required' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `SELECT 
          u.fullname,
          u.email,
          u.mobile,
          u.address_line1,
          u.address_line2,
          u.address_line3,
          u.pincode,
          u.landmark,

          mc.id AS city_id,
          mc.state_id AS state_id,

          mc.name AS city_name,
          ms.name AS state_name

        FROM users u
        LEFT JOIN master_cities mc ON u.city = mc.id
        LEFT JOIN master_states ms ON u.state = ms.id

        WHERE u.mobile = ? OR LOWER(u.email) = LOWER(?)
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