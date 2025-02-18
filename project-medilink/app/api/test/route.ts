import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Create a test user
    const newUser = await prisma.user.create({
      data: {
        firstname: 'Alice',
        lastname: 'Smith',
        email: `alice${Date.now()}@example.com`,
        password: 'hashedPasswordHere',
        user_type: 'PATIENT',
      },
    });

    // Fetch all users
    const users = await prisma.user.findMany();

    return new Response(JSON.stringify({ newUser, users }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('DB Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
