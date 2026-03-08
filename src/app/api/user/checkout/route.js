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
      userId
    } = body;

    const identifier = userId || mobile || email;

    if (!fullname || !identifier || !line1 || !pincode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (Name, Identifier, Address, Pincode)' },
        { status: 400 }
      );
    }

    // 1️⃣ Find user by mobile OR email
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

    // 2️⃣ Update address using user id
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
        email || existingUser[0].email,
        mobile || existingUser[0].mobile,
        line1,
        line2,
        line3,
        pincode,
        landmark,
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
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}