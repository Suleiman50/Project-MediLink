import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Function to send a verification email using Nodemailer
async function sendVerificationEmail(email: string, verificationToken: string) {
  // Create a transporter with your email credentials
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Change if you're using a different email service
    auth: {
      user: process.env.EMAIL_USER, // defined in your .env
      pass: process.env.EMAIL_PASS, // defined in your .env (use an app password for Gmail)
    },
  });

  // Build the verification URL (update with your actual domain)
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Convert DD/MM/YYYY format to a Date object
    const [day, month, year] = body.dob.split('/');
    const formattedDOB = new Date(`${year}-${month}-${day}`);

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create a new patient account with verified set to false
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
        verificationToken: verificationToken,
      },
    });

    // Send a verification email to the new patient
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
