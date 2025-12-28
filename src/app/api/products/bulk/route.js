import { NextResponse } from 'next/server';
import { pool } from '../../db';

export async function POST(req) {
  try {
    const products = await req.json(); // Expect array of objects

    for (const p of products) {
      await pool.query(
        `INSERT INTO products 
        (title, slug, category_id, sub_cat_id, price, discount, tax, shipping_cost, quantity, description, images)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.title, p.slug, p.category_id, p.sub_cat_id, p.price, p.discount, p.tax, p.shipping_cost, p.quantity, p.description, p.images]
      );
    }

    return NextResponse.json({ message: 'Bulk products added successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Bulk upload failed' }, { status: 500 });
  }
}
