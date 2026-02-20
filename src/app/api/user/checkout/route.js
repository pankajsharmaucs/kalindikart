import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

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
      userId // This is the identifier from your auth state (email or mobile)
    } = body;

    // Use mobile or email as the fallback if userId isn't explicitly sent
    const identifier = userId || mobile || email;

    if (!fullname || !identifier || !line1 || !pincode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (Name, Identifier, Address, Pincode)' },
        { status: 400 }
      );
    }

    /* 1️⃣ FLEXIBLE LOOKUP 
       Check if the user exists using the identifier (could be email or mobile)
    */
    const [existingUser] = await pool.query(
      'SELECT id, mobile, email FROM users WHERE (mobile = ? AND mobile <> "") OR (email = ? AND email <> "") LIMIT 1',
      [identifier, identifier]
    );

    if (!existingUser.length) {
      return NextResponse.json(
        { success: false, error: 'User record not found. Please register first.' },
        { status: 404 }
      );
    }

    const dbId = existingUser[0].id;

    /* 2️⃣ UPDATE ADDRESS
       We update via the internal 'id' which is the safest way to ensure 
       we don't create duplicate records or fail FK constraints.
    */
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
      [
        fullname, 
        email || existingUser[0].email, // Keep existing email if new one is empty
        mobile || existingUser[0].mobile, // Keep existing mobile if new one is empty
        line1, 
        line2, 
        line3, 
        pincode, 
        landmark, 
        dbId
      ]
    );

    return NextResponse.json({ success: true, message: 'Address updated successfully' });
  } catch (err) {
    console.error('Checkout API error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}