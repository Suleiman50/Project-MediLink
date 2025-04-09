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

    // Split the query into individual search terms (e.g., "Cardiologist Clinic" becomes ["Cardiologist", "Clinic"])
    const queryTerms = query.split(' ').map(term => term.trim()).filter(term => term.length > 0);

    // Create an array of `OR` conditions for first_name, last_name, and specialty based on the search terms
    const nameOrSpecialtyConditions = queryTerms.map(term => ({
      OR: [
        { first_name: { contains: term, mode: 'insensitive' } },
        { last_name: { contains: term, mode: 'insensitive' } },
        { specialty: { contains: term, mode: 'insensitive' } },
      ],
    }));

    // Special handling for exact match on common specialties like "General Practitioner"
    const exactSpecialtyConditions = queryTerms.includes("General") && queryTerms.includes("Practitioner") 
      ? [
          { specialty: { equals: "General Practitioner", mode: 'insensitive' } }
        ]
      : [];

    // Combine all search conditions into an AND clause to ensure all terms are matched
    const doctors = await prisma.doctor.findMany({
      where: {
        AND: [
          ...nameOrSpecialtyConditions,  // Name search conditions
          ...exactSpecialtyConditions,  // Exact match for General Practitioner
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
        phone_number: true,
      },
    });

    // Format the response
    const formattedDoctors = doctors.map(doc => ({
      id: doc.id.toString(),
      name: `Dr. ${doc.first_name} ${doc.last_name}`,
      specialty: doc.specialty ,
      location: doc.clinic_location || 'Location not specified',
      address: doc.clinic_location || 'Address not specified',
      email: doc.email,
      phone: doc.phone_number || 'Contact via email', // For privacy, we'll only show email
    }));

    return NextResponse.json({ doctors: formattedDoctors });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search doctors' }, { status: 500 });
  }
}
