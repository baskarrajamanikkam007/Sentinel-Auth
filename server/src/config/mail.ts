import nodemailer from 'nodemailer';

export const createMailTransport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export const mailFrom = process.env.SMTP_FROM || 'noreply@sentinelauth.com';
