import { Request } from 'express';
import nodemailer from 'nodemailer';

export const sendEmail = async (
  email: string,
  req: Request,
  resetToken: string
) => {
  // 1 create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2 define the email options
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `CRM - Forgot your password? Submit a PATCH request with your new password and confirm to: ${resetURL}.`;

  const subject = 'Your password reset token (valid for 10 min)';
  const mailOptions = {
    from: 'Eytan Krief <eytankrief@gmail.com>',
    to: email,
    subject,
    text: message,
    // html:
  };

  // 3 actually send the email
  await transporter.sendMail(mailOptions);
};
