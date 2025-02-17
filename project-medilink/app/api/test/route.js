// app/api/test/route.js
import pool from '@/lib/db';

export async function GET(request) {
  try {
    // Perform a quick test query
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    
    // rows[0].result should be "2"
    return new Response(JSON.stringify({
      success: true,
      data: rows[0].result,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('DB Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

