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
      line3,     // ✅ BACK ADDED
      city,      // ✅ NEW
      state,     // ✅ NEW
      pincode,
      landmark,
      userId
    } = body;

    const identifier = userId || mobile || email;

    // ✅ Updated validation
    if (!fullname || !identifier || !line1 || !pincode || !city || !state) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (Name, Address, City, State, Pincode)' },
        { status: 400 }
      );
    }

    // 1️⃣ Find user
    const [existingUser] = await pool.query(
      `SELECT id, mobile, email
       FROM users
       WHERE mobile = ? OR email = ?
       LIMIT 1`,
      [mobile || "", email || ""]
    );

    if (!existingUser.length) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    const dbId = existingUser[0].id;

    // 2️⃣ Update user address
    await pool.query(
      `UPDATE users SET
        fullname = ?,
        email = ?,
        mobile = ?,
        address_line1 = ?,
        address_line2 = ?,
        address_line3 = ?,
        city = ?,
        state = ?,
        pincode = ?,
        landmark = ?
      WHERE id = ?`,
      [
        fullname,
        email || existingUser[0].email,
        mobile || existingUser[0].mobile,
        line1,
        line2 || '',
        line3 || '',
        parseInt(city),
        parseInt(state),
        pincode,
        landmark || '',
        dbId
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Address updated successfully"
    });

  } catch (err) {
    console.error("Checkout API error:", err);

    return NextResponse.json(
      { success: false, error: "Something Went wrong" },
      { status: 500 }
    );
  }
}