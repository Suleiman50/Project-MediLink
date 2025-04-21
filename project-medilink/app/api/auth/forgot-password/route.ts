import { NextResponse } from "next/server";
import { PrismaClient, Patient, Doctor } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Helper: send reset email asynchronously with verification
async function sendResetEmail(email: string, resetToken: string) {
  try {
    const base = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
    const resetUrl = `${base}/auth/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection configuration
    transporter.verify((err, success) => {
      if (err) {
        console.error("[forgot-password] Transporter verify error:", err);
      } else {
        console.log("[forgot-password] Transporter is ready to send emails");
      }
    });

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href=\"${resetUrl}\">here</a> to reset your password.</p>`,
    });
    console.log("[forgot-password] Reset email sent, messageId:", info.messageId);
  } catch (err) {
    console.error("[forgot-password] Failed to send reset email to", email, err);
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Lookup user
    let user: Patient | Doctor | null = await prisma.patient.findUnique({ where: { email } });
    let isPatient = true;
    if (!user) {
      user = await prisma.doctor.findUnique({ where: { email } });
      isPatient = false;
    }
    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Generate and store reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    if (isPatient) {
      await prisma.patient.update({ where: { email }, data: { resetToken } });
    } else {
      await prisma.doctor.update({ where: { email }, data: { resetToken } });
    }

    // Queue email send
    setImmediate(() => sendResetEmail(email, resetToken));

    return NextResponse.json({ message: "Password reset email queued." }, { status: 200 });
  } catch (error) {
    console.error("[forgot-password] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}