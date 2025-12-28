import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

export async function POST(req) {
  try {
    const { emailOrMobile, password } = await req.json();

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR mobile = ?',
      [emailOrMobile, emailOrMobile]
    );

    if (rows.length === 0)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });

    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
