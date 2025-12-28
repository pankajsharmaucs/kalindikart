import { NextResponse } from 'next/server';
import { pool } from '../db';



export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const productSlug = searchParams.get('slug');      // product detail
    const categorySlug = searchParams.get('category'); // category page

    /* =========================
       SINGLE PRODUCT BY SLUG
    ========================= */
    if (productSlug) {
      const [rows] = await pool.query(
        `
        SELECT p.*, c.category_name, c.slug AS category_slug
        FROM products p
        LEFT JOIN master_category c ON p.category_id = c.id
        WHERE p.slug = ?
        LIMIT 1
        `,
        [productSlug]
      );

      if (rows.length === 0) {
        return NextResponse.json(null, { status: 404 });
      }

      return NextResponse.json(rows[0]);
    }

    /* =========================
       CATEGORY → category_id
    ========================= */

    let categoryId = null;

    if (categorySlug) {
      const [cat] = await pool.query(
        `SELECT id FROM master_category WHERE LOWER(slug) = ? LIMIT 1`,
        [categorySlug.toLowerCase()]
      );

      if (cat.length === 0) {
        return NextResponse.json([]); // no category → no products
      }

      categoryId = cat[0].id;
    }

    /* =========================
       FETCH PRODUCTS BY category_id
    ========================= */

    let query = `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.price,
        p.discount,
        p.tax,
        p.shipping_cost,
        p.quantity,
        p.stock,
        p.description,
        p.images,
        p.created_at,
        c.category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN master_category c ON p.category_id = c.id
      WHERE p.status = 'active'
    `;

    const params = [];

    if (categoryId) {
      query += ` AND p.category_id = ?`;
      params.push(categoryId);
    }

    query += ` ORDER BY p.id DESC`;

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);

  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}


/* =========================
   POST: Add Product
========================= */
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      title,
      slug,
      category_id,
      sub_cat_id,
      price,
      discount,
      tax,
      shipping_cost,
      quantity,
      description,
      images
    } = body;

    const [result] = await pool.query(
      `
      INSERT INTO products (
        title, slug, category_id, sub_cat_id,
        price, discount, tax, shipping_cost,
        quantity, description, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        slug,
        category_id,
        sub_cat_id || null,
        price,
        discount || 0,
        tax || 0,
        shipping_cost || 0,
        quantity,
        description,
        JSON.stringify(images || [])
      ]
    );

    return NextResponse.json({
      message: 'Product added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('ADD PRODUCT ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to add product' },
      { status: 500 }
    );
  }
}
