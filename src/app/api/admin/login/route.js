import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../db';

const JWT_SECRET = process.env.JWT_SECRET || 'ashjgdjahsg57576576jgjhgjhgj';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Fetch user - Ensure status matches your ENUM ('active')
    const [rows] = await pool.query(
      'SELECT * FROM admin_users WHERE email = ? AND status = "active" LIMIT 1', 
      [email]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials or account inactive' }, { status: 401 });
    }

    const admin = rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(String(password), admin.password);
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Update last_login (Using a simplified SQL syntax to avoid 500 errors)
    try {
        await pool.query('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);
    } catch (dbErr) {
        console.error('Non-critical error updating last_login:', dbErr.message);
        // We don't return 500 here so the user can still login even if timestamp update fails
    }

    // 4. Generate Token
    const token = jwt.sign(
      { id: admin.id, role: admin.role, email: admin.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
    });

    // 5. Set Cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax'
    });

    return response;

  } catch (error) {
    // THIS LOG IS VITAL: Check your VS Code terminal to see this output
    console.error('--- FULL LOGIN ERROR ---');
    console.error(error); 
    return NextResponse.json({ 
        error: 'Internal Server Error', 
        details: error.message 
    }, { status: 500 });
  }
}