// app/api/patients/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { transporter } from "@/lib/mailer";
import { NextResponse } from "next/server";

/* ----------  POST /api/patients  ---------- */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Duplicate check
    const existing = await prisma.patient.findUnique({
      where: { email: body.email },
    });
    if (existing) {
      return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
      );
    }

    // 2. Password strength
    const pwdErr = validatePasswordStrength(body.password);
    if (pwdErr) {
      return NextResponse.json({ error: pwdErr }, { status: 400 });
    }

    // 3. Prepare data
    const [d, m, y] = body.dob.split("/");
    const dob = new Date(`${y}-${m}-${d}`);
    const hash = await bcrypt.hash(body.password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    // 4. Create patient
    await prisma.patient.create({
      data: {
        first_name:        body.firstName,
        last_name:         body.lastName,
        dob,
        email:             body.email,
        password:          hash,
        height:            body.height,
        gender:            body.gender.toUpperCase(),
        weight:            body.weight,
        bloodType:         body.bloodType,
        allergies:         body.allergies,
        verified:          false,
        verificationToken: token,
      },
    });

    // 5. Queue verification e-mail (non-blocking)
    setImmediate(() =>
        sendVerificationEmail(body.email, token).catch((err) =>
            console.error("[email] patient verification failed:", err)
        )
    );

    // 6. Respond instantly
    return NextResponse.json(
        { message: "Patient created; verification e-mail queued." },
        { status: 201 }
    );
  } catch (err: any) {
    console.error("[patients POST] error:", err);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
  }
}

/* ----------  GET /api/patients  ---------- */
export async function GET() {
  try {
    const patients = await prisma.patient.findMany();
    const formatted = patients.map((p) => ({
      ...p,
      dob: p.dob
          .toISOString()
          .split("T")[0]
          .split("-")
          .reverse()
          .join("/"),
    }));
    return NextResponse.json({ patients: formatted }, { status: 200 });
  } catch (err: any) {
    console.error("[patients GET] error:", err);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
  }
}

/* ----------  Helper: send verification e-mail ---------- */
async function sendVerificationEmail(email: string, token: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const url = `${base}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from:    process.env.SMTP_FROM,
    to:      email,
    subject: "Verify your MediLink account",
    html:    `<p>Please verify your e-mail by clicking <a href="${url}">here</a>.</p>`,
    text:    `Please verify your account: ${url}`,
  });

  console.log("[email] patient verification sent →", email);
}

/* ----------  Helper: password validator ---------- */
function validatePasswordStrength(pw: string): string | null {
  if (pw.length < 6) return "Password must be at least 6 characters long.";
  if (!/[A-Z]/.test(pw))
    return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(pw))
    return "Password must contain at least one number.";
  if (!/[!@#$%^&*]/.test(pw))
    return "Password must contain at least one special character (!@#$%^&*).";
  return null;
}