import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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
const validatePasswordStrength = (password: string) => {
  if (password.length < 6) return "Password must be at least 6 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[!@#$%^&*]/.test(password)) return "Password must contain at least one special character (!@#$%^&*).";
  return null; // Valid password
};
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Check if this email already exists in the Patient table
    const existingPatient = await prisma.patient.findUnique({
      where: { email: body.email },
    });
    if (existingPatient) {
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const passwordError = validatePasswordStrength(body.password); if (passwordError) {
      return new Response(JSON.stringify({ error: passwordError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // 2. Convert DD/MM/YYYY format to a Date object
    const [day, month, year] = body.dob.split('/');
    const formattedDOB = new Date(`${year}-${month}-${day}`);

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // 4. Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 5. Create a new patient record
    const newPatient = await prisma.patient.create({
      data: {
        first_name: body.firstName,
        last_name: body.lastName,
        dob: formattedDOB,
        email: body.email,
        password: hashedPassword,
        height: body.height,
        gender: body.gender.toUpperCase(),
        weight: body.weight,
        bloodType: body.bloodType,
        verified: false,
        verificationToken,
      },
    });

    // 6. Send a verification email
    await sendVerificationEmail(body.email, verificationToken);

    return new Response(
      JSON.stringify({ message: "Patient account created. A verification email has been sent." }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error creating patient:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  try {
    const patients = await prisma.patient.findMany();

    // Format DOB to DD/MM/YYYY before sending response
    const formattedPatients = patients.map(patient => ({
      ...patient,
      dob: patient.dob.toISOString().split('T')[0].split('-').reverse().join('/'),
    }));

    return new Response(JSON.stringify({ patients: formattedPatients }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
