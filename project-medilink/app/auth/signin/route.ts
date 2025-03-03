import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export async function POST(request: Request) {
  try {
    const { email, password, userType } = await request.json();

    // Find the user based on the provided userType
    let user;
    if (userType === "Patient") {
      user = await prisma.patient.findUnique({ where: { email } });
    } else if (userType === "Doctor") {
      user = await prisma.doctor.findUnique({ where: { email } });
    } else {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Compare the password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Optionally check if the user's email is verified
    if (!user.verified) {
      return NextResponse.json({ error: "Please verify your email before signing in." }, { status: 403 });
    }

    // Generate a JWT token valid for 1 hour
    const tokenPayload = { id: user.id, email: user.email, userType };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    return NextResponse.json({ message: "Sign in successful", token }, { status: 200 });
  } catch (error: any) {
    console.error("Sign in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
