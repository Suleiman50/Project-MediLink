import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if a doctor with this email already exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { email: body.email },
    });
    if (existingDoctor) {
      return new NextResponse(
        JSON.stringify({ error: "User already exists" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert DD/MM/YYYY format to a Date for Prisma
    const [day, month, year] = body.dob.split('/');
    const formattedDOB = new Date(`${year}-${month}-${day}`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create a new doctor account with verified set to false
    const newDoctor = await prisma.doctor.create({
      data: {
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        password: hashedPassword,
        dob: formattedDOB,
        gender: body.gender.toUpperCase(),
        specialty: body.specialty,
        verified: false,
        verificationToken: verificationToken,
      },
    });

    // Send a verification email to the created account
    await sendVerificationEmail(body.email, verificationToken);

    return new NextResponse(
      JSON.stringify({ message: "Doctor account created. A verification email has been sent." }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating doctor:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Function to send a verification email using Nodemailer
async function sendVerificationEmail(email: string, verificationToken: string) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Please verify your email address',
    text: `Thank you for registering. Please verify your email by clicking the following link: ${verificationUrl}`,
    html: `<p>Thank you for registering.</p>
           <p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
  };

  await transporter.sendMail(mailOptions);
}
