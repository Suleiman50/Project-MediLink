import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Convert DD/MM/YYYY format to YYYY-MM-DD format for Prisma
    const [day, month, year] = body.dob.split('/');
    const formattedDOB = new Date(`${year}-${month}-${day}`);

    // Create a new patient
    const newPatient = await prisma.patient.create({
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
        dob: formattedDOB, // Store as DateTime
        email: body.email,
        password: body.password,  // In production, store a hashed password
        height: body.height,
        gender: body.gender,
        weight: body.weight,      // Ensure it's one of: "MALE", "FEMALE", "OTHER"
        bloodType: body.bloodType,// e.g. "O_POS", "A_NEG", ...
      },
    });

    return new Response(JSON.stringify({ newPatient }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error creating patient:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  try {
    const patients = await prisma.patient.findMany();

    // Format DOB to DD/MM/YYYY before sending response
    const formattedPatients = patients.map(patient => ({
      ...patient,
      dob: patient.dob.toISOString().split('T')[0].split('-').reverse().join('/'), // Convert YYYY-MM-DD to DD/MM/YYYY
    }));

    return new Response(JSON.stringify({ patients: formattedPatients }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

