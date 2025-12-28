// app/api/subcategory/route.js
import { NextResponse } from 'next/server';
import { pool } from '../db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category_slug = searchParams.get('category_slug'); // slug from query

    if (!category_slug) {
      // Return all subcategories if no slug provided
      const [allSubcats] = await pool.query('SELECT * FROM master_sub_category ORDER BY id DESC');
      return NextResponse.json(allSubcats);
    }

    // Get category ID from slug
    const [category] = await pool.query(
      'SELECT id FROM master_category WHERE slug = ? LIMIT 1',
      [category_slug]
    );

    if (!category.length) return NextResponse.json([], { status: 200 });

    const categoryId = category[0].id;

    // Fetch subcategories by category ID
    const [subcats] = await pool.query(
      'SELECT * FROM master_sub_category WHERE category_id = ? ORDER BY id DESC',
      [categoryId]
    );

    return NextResponse.json(subcats);
  } catch (err) {
    console.error('Failed to fetch subcategories:', err);
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { category_id, sub_category_name, slug, status, image } = await req.json();
    const [result] = await pool.query(
      'INSERT INTO master_sub_category (category_id, sub_category_name, slug, status, image) VALUES (?, ?, ?, ?, ?)',
      [category_id, sub_category_name, slug, status, image]
    );
    return NextResponse.json({ message: 'Subcategory added', id: result.insertId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add subcategory' }, { status: 500 });
  }
}

