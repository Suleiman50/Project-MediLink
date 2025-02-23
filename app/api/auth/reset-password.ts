import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // ✅ Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    // ✅ Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // ✅ Save reset token in DB
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // ✅ Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ✅ Use your email
        pass: process.env.EMAIL_PASS, // ✅ Use app password
      },
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    return new Response(JSON.stringify({ message: "Reset link sent to email" }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
