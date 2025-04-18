import { NextResponse } from "next/server";
import { PrismaClient,Patient,Doctor } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Check in Patients table first
    let user: Patient | Doctor | null = await prisma.patient.findUnique({ where: { email } });

    let userType = "Patient";

    // If not found, check in Doctors table
    if (!user) {
      user = await prisma.doctor.findUnique({ where: { email } });
      userType = "Doctor";
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if email is verified
    if (!user.verified) {
      return NextResponse.json({ error: "Please verify your email before signing in." }, { status: 403 });
    }

    // Generate JWT token (Dynamically assign userType)
    const tokenPayload = { id: user.id, email: user.email, userType };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

    const userPayload: any = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      gender: user.gender,
      dob: user.dob,
      userType,
    };
    
    // Add patient-specific fields
    if (userType === "Patient") {
      userPayload.height = (user as any).height || null;
      userPayload.weight = (user as any).weight || null;
      userPayload.bloodType = (user as any).bloodType || null;
      userPayload.allergies = (user as any).allergies || null;
    }
    
    // Add doctor-specific fields
    if (userType === "Doctor") {
      userPayload.specialty = (user as any).specialty || null;
      userPayload.phone_number = (user as Doctor).phone_number || null;
    }
    
    return NextResponse.json({ message: "Sign in successful", token, user: userPayload }, { status: 200 });
    
  } catch (error: any) {
    console.error("Sign in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
