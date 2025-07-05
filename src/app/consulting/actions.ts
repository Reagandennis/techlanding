
'use server';

import * as z from 'zod';
import nodemailer from 'nodemailer';

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(10),
});

export async function handleSendEmail(data: z.infer<typeof formSchema>) {
  const { name, email, company, message } = data;

  const transporter = nodemailer.createTransport({
    // You'll need to configure your email provider here
    // For example, using Gmail:
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER, // This should be your sending email address
    to: 'consulting@techgetafrica.com', // This is where you'll receive the inquiries
    replyTo: email,
    subject: `New Consulting Inquiry from ${name}`,
    html: `
      <h1>New Consulting Inquiry</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || 'Not provided'}</p>
      <hr />
      <h2>Message:</h2>
      <p>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false };
  }
}
