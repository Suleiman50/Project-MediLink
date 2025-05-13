import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host:       process.env.SMTP_HOST,
    port:       Number(process.env.SMTP_PORT),
    secure:     false,            // false = use STARTTLS on 587
    requireTLS: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: true,   // now the cert name matches
    },
    connectionTimeout: 5_000,
    socketTimeout:     4_000,
    greetingTimeout:   3_000,
});