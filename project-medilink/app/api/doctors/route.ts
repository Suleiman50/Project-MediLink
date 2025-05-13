// app/api/doctors/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { transporter } from "@/lib/mailer";
import { NextResponse } from "next/server";

/* ----------  POST /api/doctors  ---------- */
export async function POST(request: Request) {
  console.log(`[doctors POST] ${new Date().toISOString()} - Request received`);
  try {
    const body = await request.json();

    // 1. Duplicate check
    const existing = await prisma.doctor.findUnique({
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

    // 3. Parse DOB
    const [day, month, year] = body.dob.split("/");
    const dob = new Date(`${year}-${month}-${day}`);

    // 4. Hash password & make token
    const hash = await bcrypt.hash(body.password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    // 5. Create doctor (verified: false)
    const newDoctor = await prisma.doctor.create({
      data: {
        first_name:        body.firstName,
        last_name:         body.lastName,
        email:             body.email,
        password:          hash,
        dob,
        gender:            body.gender.toUpperCase(),
        specialty:         body.specialty,
        phone_number:      body.phoneNumber,
        verified:          false,
        verificationToken: token,
      },
    });

    // 6. Queue verification email
    setImmediate(() =>
        sendVerificationEmail(body.email, token).catch((err) =>
            console.error("[email] doctor verification failed:", err)
        )
    );

    // 7. Instant response
    return NextResponse.json(
        { message: "Doctor account created; verification e-mail queued." },
        { status: 201 }
    );
  } catch (err: any) {
    console.error("[doctors POST] error:", err);
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
    subject: "Verify your MediLink doctor account",
    html:    `<p>Please verify your e-mail by clicking <a href="${url}">here</a>.</p>`,
    text:    `Please verify your account: ${url}`,
  });

  console.log("[email] doctor verification sent →", email);
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