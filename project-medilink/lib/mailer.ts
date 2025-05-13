import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host:     process.env.SMTP_HOST,
    port:     Number(process.env.SMTP_PORT),
    secure:   Number(process.env.SMTP_PORT) === 465,
    requireTLS: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 5_000,
    socketTimeout:     4_000,
    greetingTimeout:   3_000,
});