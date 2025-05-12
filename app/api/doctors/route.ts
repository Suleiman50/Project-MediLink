import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

/* ----------  POST /api/doctors  ---------- */
export async function POST(request: Request) {
  console.log(`[doctors POST] ${new Date().toISOString()} - Request received`);
  try {
    const body = await request.json();
    console.log('[doctors POST] Payload:', {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      dob: body.dob,
      gender: body.gender,
      specialty: body.specialty,
      phoneNumber: body.phoneNumber
    });

    // 1. Duplicate check
    console.log('[doctors POST] Checking for existing doctor:', body.email);
    const existing = await prisma.doctor.findUnique({ where: { email: body.email } });
    if (existing) {
      console.warn('[doctors POST] Duplicate email found:', body.email);
      return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
      );
    }

    // 2. Password strength
    console.log('[doctors POST] Validating password strength');
    const pwdErr = validatePasswordStrength(body.password);
    if (pwdErr) {
      console.warn('[doctors POST] Password validation error:', pwdErr);
      return NextResponse.json({ error: pwdErr }, { status: 400 });
    }

    // 3. Parse DOB
    console.log('[doctors POST] Parsing date of birth:', body.dob);
    const [day, month, year] = body.dob.split('/');
    const dob = new Date(`${year}-${month}-${day}`);

    // 4. Hash password & make token
    console.log('[doctors POST] Hashing password and generating token');
    const hash = await bcrypt.hash(body.password, 10);
    const token = crypto.randomBytes(32).toString('hex');

    // 5. Create doctor (verified: false)
    console.log('[doctors POST] Creating new doctor record');
    const newDoctor = await prisma.doctor.create({
      data: {
        first_name:  body.firstName,
        last_name:   body.lastName,
        email:       body.email,
        password:    hash,
        dob,
        gender:      body.gender.toUpperCase(),
        specialty:   body.specialty,
        phone_number: body.phoneNumber,
        verified:    false,
        verificationToken: token,
      },
    });
    console.log('[doctors POST] Doctor created with ID:', newDoctor.id);

    // 6. Queue verification email (non‑blocking)
    console.log('[doctors POST] Queuing verification email for:', body.email);
    setImmediate(() =>
        sendVerificationEmail(body.email, token).catch(err =>
            console.error('[email] doctor verification failed:', err.message)
        )
    );

    // 7. Instant response
    console.log('[doctors POST] Responding to client');
    return NextResponse.json(
        { message: "Doctor account created; verification e‑mail queued." },
        { status: 201 }
    );
  } catch (err: any) {
    console.error('[doctors POST] Error:', err);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
  }
}

/* ----------  Helper: send verification e‑mail ---------- */
async function sendVerificationEmail(email: string, token: string) {
  console.log('[email] Preparing to send verification to:', email);
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,           // use STARTTLS
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
    connectionTimeout: 5000,
    socketTimeout:     4000,
    greetingTimeout:   3000,
  });

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url  = `${base}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from:    process.env.EMAIL_USER,
    to:      email,
    subject: "Verify your MediLink doctor account",
    html:    `<p>Please verify your e‑mail by clicking <a href="${url}">here</a>.</p>`,
    text:    `Please verify your account: ${url}`,
  });

  console.log('[email] doctor verification sent →', email);
}

/* ----------  Helper: password validator ---------- */
function validatePasswordStrength(pw: string): string | null {
  if (pw.length < 6)            return "Password must be at least 6 characters long.";
  if (!/[A-Z]/.test(pw))        return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(pw))        return "Password must contain at least one number.";
  if (!/[!@#$%^&*]/.test(pw))   return "Password must contain at least one special character (!@#$%^&*).";
  return null;
}
