import { NextResponse } from "next/server";
import { PrismaClient, BloodType } from "@prisma/client"; // Import BloodType Enum
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// ✅ Function to Convert BloodType Enum back to readable format (e.g., "O_POS" → "O+")
const formatBloodType = (value: BloodType | null) => {
  if (!value) return null;
  
  const bloodTypeMap: Record<BloodType, string> = {
    A_POS: "A+",
    A_NEG: "A-",
    B_POS: "B+",
    B_NEG: "B-",
    AB_POS: "AB+",
    AB_NEG: "AB-",
    O_POS: "O+",
    O_NEG: "O-",
  };

  return bloodTypeMap[value] || null;
};

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ valid: false, error: "Token missing" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 401 });
    }

    let user = await prisma.patient.findUnique({ where: { email: decoded.email } });
    let userType = "Patient";

    if (!user) {
      user = await prisma.doctor.findUnique({ where: { email: decoded.email } });
      userType = "Doctor";
    }

    if (!user) {
      return NextResponse.json({ valid: false, error: "User not found" }, { status: 404 });
    }

    const userPayload: any = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      gender: user.gender,
      dob: user.dob ? new Date(user.dob as string).toISOString().split("T")[0] : null,
      userType,
    };

    // ✅ Convert and add patient-specific fields
    if (userType === "Patient") {
      userPayload.height = (user as any).height ?? null;
      userPayload.weight = (user as any).weight ?? null;
      userPayload.bloodType = formatBloodType((user as any).bloodType); // ✅ Convert "O_POS" → "O+"
      userPayload.allergies = (user as any).allergies ?? null;
    }

    // ✅ Convert and add doctor-specific fields
    if (userType === "Doctor") {
      userPayload.specialty = (user as any).specialty ?? null;
      userPayload.clinic_location = (user as any).clinic_location ?? null;
      userPayload.phone_number = (user as any).phone_number ?? null;
    }

    return NextResponse.json({ valid: true, user: userPayload }, { status: 200 });
  } catch (error) {
    console.error("Verify Token Error:", error);
    return NextResponse.json({ valid: false, error: "Internal Server Error" }, { status: 500 });
  }
}