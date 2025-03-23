import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  } else if (patient) {
    await prisma.patient.update({
      where: { id: patient.id },
      data: { verified: true, verificationToken: null },
    });
  }

  // Redirect the user to a friendly success page
  return NextResponse.redirect("http://localhost:3000/auth/verify-success");
}
