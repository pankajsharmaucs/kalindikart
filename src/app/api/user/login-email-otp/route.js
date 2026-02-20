import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { pool } from '../../db.js';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const otp = Math.floor(10000 + Math.random() * 90000); // 5-digit OTP

    // 🔍 Check user
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      // 🔥 Create new user
      await pool.query(
        `INSERT INTO users (email, otp, verified, status)
         VALUES (?, ?, 0, 'active')`,
        [email, otp]
      );
    } else {
      // 🔥 Update OTP for existing user
      await pool.query(
        'UPDATE users SET otp = ?, verified = 0 WHERE email = ?',
        [otp, email]
      );
    }

    // 📧 Send OTP Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: `"KalindiKart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your KalindiKart Login OTP',
      html: `
        <div style="font-family: Arial; line-height:1.6">
          <h2>🔐 Your Login OTP</h2>
          <p>Use this OTP to login to <b>KalindiKart</b>:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: 'OTP sent successfully',
      success: true,
      otp, // ❌ remove in production
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'OTP send failed' }, { status: 500 });
  }
}