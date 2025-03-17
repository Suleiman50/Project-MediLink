import { NextResponse } from "next/server";
import { PrismaClient, Patient, Doctor } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    let user: Patient | Doctor | null = await prisma.patient.findUnique({ where: { email } });
    let isPatient = true;

    if (!user) {
      user = await prisma.doctor.findUnique({ where: { email } });
      isPatient = false;
    }

    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    if (isPatient && "height" in user) {
      await prisma.patient.update({
        where: { email },
        data: { resetToken },
      });
    } else if (!isPatient && "specialty" in user) {
      await prisma.doctor.update({
        where: { email },
        data: { resetToken },
      });
    } else {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    // Send reset email
    const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });

    return NextResponse.json({ message: "Reset email sent." }, { status: 200 });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
