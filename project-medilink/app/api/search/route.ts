import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    if (!query) {
      return NextResponse.json({ doctors: [] });
    }

    // Search doctors based on name or specialty
    const doctors = await prisma.doctor.findMany({
      where: {
        OR: [
          { first_name: { contains: query, mode: 'insensitive' } },
          { last_name: { contains: query, mode: 'insensitive' } },
          { specialty: { contains: query, mode: 'insensitive' } }
        ],
        verified: true, // Only return verified doctors
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        specialty: true,
        clinic_location: true,
        email: true,
      },
    });

    // Format the response
    const formattedDoctors = doctors.map(doc => ({
      id: doc.id.toString(),
      name: `Dr. ${doc.first_name} ${doc.last_name}`,
      specialty: doc.specialty || 'General Practitioner',
      location: doc.clinic_location || 'Location not specified',
      address: doc.clinic_location || 'Address not specified',
      email: doc.email,
      phone: 'Contact via email', // For privacy, we'll only show email
    }));

    return NextResponse.json({ doctors: formattedDoctors });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search doctors' }, { status: 500 });
  }
}
