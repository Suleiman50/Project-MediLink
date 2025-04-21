import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Use the alternative solution to cast globalThis as any
  (globalThis as any).prisma = (globalThis as any).prisma || new PrismaClient();
  prisma = (globalThis as any).prisma;
}
// Function to send email asynchronously
const sendVerificationEmail = async (email: string, name: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use another service like SendGrid, Mailgun
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'your-email@example.com',
    to: email,
    subject: 'Email Verification Success',
    text: `Hello ${name}, your email has been successfully verified.`,
    html: `<p>Hello ${name}, your email has been successfully verified.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Attempt to find a matching doctor by token
  const doctor = await prisma.doctor.findFirst({
    where: { verificationToken: token },
  });

  // Attempt to find a matching patient by token if not found in doctors
  const patient = !doctor
    ? await prisma.patient.findFirst({ where: { verificationToken: token } })
    : null;

  if (!doctor && !patient) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  if (doctor) {
    await prisma.doctor.update({
      where: { id: doctor.id },
      data: { verified: true, verificationToken: null },
    });

    sendVerificationEmail(doctor.email, `${doctor.first_name} ${doctor.last_name}`);  // Send email asynchronously
  } else if (patient) {
    await prisma.patient.update({
      where: { id: patient.id },
      data: { verified: true, verificationToken: null },
    });

    sendVerificationEmail(patient.email, `${patient.first_name} ${patient.last_name}`);  // Send email asynchronously
  }

  // Redirect the user to a friendly success page
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return NextResponse.redirect(new URL("/auth/verify-success", baseUrl));
}
