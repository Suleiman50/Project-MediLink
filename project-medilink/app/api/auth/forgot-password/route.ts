// app/api/auth/forgot-password/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PrismaClient, Patient, Doctor } from "@prisma/client";
import crypto from "crypto";
import { transporter } from "@/lib/mailer";

const prisma = new PrismaClient();

async function sendResetEmail(email: string, resetToken: string) {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const resetUrl = `${base}/auth/reset-password?token=${resetToken}`;

  try {
    console.log("[forgot-password] Sending reset to", email);
    const info = await transporter.sendMail({
      from:    process.env.SMTP_FROM,
      to:      email,
      subject: "MediLink Password Reset Request",
      html:    `<p>To reset your password, click <a href="${resetUrl}">here</a>.</p>`,
      text:    `Reset your password: ${resetUrl}`,
    });
    console.log("[forgot-password] Reset email sent, messageId:", info.messageId);
  } catch (err: any) {
    console.error("[forgot-password] Failed to send reset email:", err);
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 1) Find patient or doctor
    let user: Patient | Doctor | null = await prisma.patient.findUnique({ where: { email } });
    let isPatient = true;
    if (!user) {
      user = await prisma.doctor.findUnique({ where: { email } });
      isPatient = false;
    }
    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // 2) Generate & store reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    if (isPatient) {
      await prisma.patient.update({ where: { email }, data: { resetToken } });
    } else {
      await prisma.doctor.update({ where: { email }, data: { resetToken } });
    }

    // 3) Queue email
    setImmediate(() => sendResetEmail(email, resetToken));

    return NextResponse.json({ message: "Password reset email queued." }, { status: 200 });
  } catch (error: any) {
    console.error("[forgot-password] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}