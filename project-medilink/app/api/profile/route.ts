import { NextResponse } from "next/server";
import { PrismaClient, BloodType } from "@prisma/client"; // Import BloodType enum
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const { id, userType } = decoded;
    const data = await request.json();

    // ✅ Convert string values to Float or null
    const parseFloatOrNull = (value: any) => (value !== undefined && value !== "" ? parseFloat(value) : null);

    // ✅ Map user input to valid BloodType enums
    const bloodTypeMap: Record<string, BloodType> = {
      "A+": BloodType.A_POS,
      "A-": BloodType.A_NEG,
      "B+": BloodType.B_POS,
      "B-": BloodType.B_NEG,
      "AB+": BloodType.AB_POS,
      "AB-": BloodType.AB_NEG,
      "O+": BloodType.O_POS,
      "O-": BloodType.O_NEG,
    };

    const parseBloodType = (value: string | null) => (value && bloodTypeMap[value] ? bloodTypeMap[value] : null);

    if (userType === "Patient") {
      const { height, weight, allergies, bloodType } = data;

      // Update patient profile with correctly formatted values
      const updatedPatient = await prisma.patient.update({
        where: { id },
        data: {
          height: parseFloatOrNull(height),
          weight: parseFloatOrNull(weight),
          allergies: allergies || null,
          bloodType: parseBloodType(bloodType), // ✅ Converts "O+" → "O_POS"
        },
      });

      return NextResponse.json({
        message: "Patient profile updated successfully",
        user: updatedPatient,
      }, { status: 200 });

    } else if (userType === "Doctor") {
      const { height, weight, allergies, bloodType, specialty, clinic_location } = data;

      // Update doctor profile with correctly formatted values
      const updatedDoctor = await prisma.doctor.update({
        where: { id },
        data: {
          height: parseFloatOrNull(height),
          weight: parseFloatOrNull(weight),
          allergies: allergies || null,
          bloodType: parseBloodType(bloodType), // ✅ Converts "O+" → "O_POS"
          specialty: specialty || null,
          clinic_location: clinic_location || null,
        },
      });

      return NextResponse.json({
        message: "Doctor profile updated successfully",
        user: updatedDoctor,
      }, { status: 200 });

    } else {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}