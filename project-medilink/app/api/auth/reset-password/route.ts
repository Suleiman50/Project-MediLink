import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    console.log("Received reset token:", token);

    // Check if a patient or doctor exists with this reset token
    let user = await prisma.patient.findFirst({ where: { resetToken: token } });
    let isPatient = true;

    if (!user) {
      user = await prisma.doctor.findFirst({ where: { resetToken: token } });
      isPatient = false;
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    console.log("User found:", user.email);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token
    if (isPatient) {
      await prisma.patient.update({
        where: { email: user.email },
        data: { password: hashedPassword, resetToken: null },
      });
    } else {
      await prisma.doctor.update({
        where: { email: user.email },
        data: { password: hashedPassword, resetToken: null },
      });
    }

    return NextResponse.json({ message: "Password reset successful." }, { status: 200 });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
