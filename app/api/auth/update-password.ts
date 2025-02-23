import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    // ✅ Find user with the reset token
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });

    if (!user) {
      return new Response(JSON.stringify({ message: "Invalid or expired token" }), { status: 400 });
    }

    // ✅ Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update password and remove reset token
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    return new Response(JSON.stringify({ message: "Password updated successfully" }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
