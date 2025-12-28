import { NextResponse } from 'next/server';
import { pool } from '../db';

// Get all categories
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM master_category');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET /category:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// Add new category
export async function POST(req) {
  try {
    const { category_name, slug, status, image } = await req.json();
    const [result] = await pool.query(
      'INSERT INTO master_category (category_name, slug, status, image) VALUES (?, ?, ?, ?)',
      [category_name, slug, status, image]
    );

    return NextResponse.json({ message: 'Category added successfully', id: result.insertId });
  } catch (error) {
    console.error('POST /category:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
