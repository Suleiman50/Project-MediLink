import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const userAgent = request.headers.get("user-agent") || "";
  console.log(`[verify-email] GET token: ${token}, UA: ${userAgent}`);

  if (!token) {
    console.error("[verify-email] Missing token");
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Normalize base URL without trailing slash
  const rawBase = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const baseUrl = rawBase.replace(/\/$/, "");

  // Skip consumption for known link scanners (e.g., Outlook Safe Links)
  const scannerRegex = /Microsoft Office Live Preview|Microsoft Office Outlook|BingPreview|Outlook/i;
  if (scannerRegex.test(userAgent)) {
    console.log(`[verify-email] Detected scanner UA, skipping token consumption.`);
    // Return a simple OK to prevent 404s
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  // Attempt to find a matching doctor by token
  const doctor = await prisma.doctor.findFirst({ where: { verificationToken: token } });
  // Attempt to find a matching patient by token if not found in doctors
  const patient = !doctor
      ? await prisma.patient.findFirst({ where: { verificationToken: token } })
      : null;

  if (!doctor && !patient) {
    console.warn(`[verify-email] Token not found or already used: ${token}`);
    // Redirect to success page with 'already' status
    return NextResponse.redirect(new URL(`/auth/verify-success?status=already`, baseUrl));
  }

  if (doctor) {
    console.log(`[verify-email] Verifying doctor id=${doctor.id}`);
    await prisma.doctor.update({ where: { id: doctor.id }, data: { verified: true, verificationToken: null } });
  } else {
    console.log(`[verify-email] Verifying patient id=${patient!.id}`);
    await prisma.patient.update({ where: { id: patient!.id }, data: { verified: true, verificationToken: null } });
  }

  console.log(`[verify-email] Token consumed successfully: ${token}`);
  return NextResponse.redirect(new URL(`/auth/verify-success`, baseUrl));
}
