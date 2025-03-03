import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    return new Response(
      JSON.stringify({ message: "Doctor account created. A verification email has been sent." }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error creating doctor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Function to send a verification email using Nodemailer
async function sendVerificationEmail(email: string, verificationToken: string) {
  // Create a transporter using your SMTP settings
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or use another service / host, port, secure options
    auth: {
      user: process.env.EMAIL_USER, // your email from .env
      pass: process.env.EMAIL_PASS, // your email password or app password from .env
    },
  });

  // Construct the verification URL (update "your-domain.com" with your actual domain)
  const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;

  // Set up the email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Please verify your email address',
    text: `Thank you for registering. Please verify your email by clicking the following link: ${verificationUrl}`,
    html: `<p>Thank you for registering.</p>
           <p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
}
