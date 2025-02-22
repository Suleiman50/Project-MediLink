import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Convert DD/MM/YYYY format to YYYY-MM-DD format for Prisma
    const [day, month, year] = body.dob.split('/');
    const formattedDOB = new Date(`${year}-${month}-${day}`);

    // Create a new doctor (Include all required fields)
    const newDoctor = await prisma.doctor.create({
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password: body.password,  // In production, store a hashed password
        dob: formattedDOB,        // Ensure the date is properly formatted
        gender: body.gender,      // Ensure it's one of: "MALE", "FEMALE", "OTHER"
        specialty: body.specialty,
      },
    });

    return new Response(JSON.stringify({ newDoctor }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error creating doctor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

