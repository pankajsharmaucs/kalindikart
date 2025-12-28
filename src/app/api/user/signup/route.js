import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '../../db.js';

export async function POST(req) {
  try {
    const { name, email, mobile, password } = await req.json();

    if (!email && !mobile) {
      return NextResponse.json({ error: 'Email or Mobile is required' }, { status: 400 });
    }

    // Check if user exists
    const [exist] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR mobile = ?',
      [email, mobile]
    );
    if (exist.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, mobile, password, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, mobile, hashed]
    );

    return NextResponse.json({ message: 'Signup successful', id: result.insertId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
