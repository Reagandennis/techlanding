import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userType, formData } = data;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Format email content based on user type
    let emailContent = '';
    let subject = '';

    if (userType === 'accelerator') {
      subject = 'New Accelerator Program Application - TechGetAfrica';
      emailContent = `
        <h2>New Accelerator Program Application</h2>
        <p>A new business has applied to our accelerator program:</p>
        
        <h3>Business Information</h3>
        <ul>
          <li><strong>Business Name:</strong> ${formData.businessName}</li>
          <li><strong>Business Type:</strong> ${formData.businessType}</li>
          <li><strong>Stage:</strong> ${formData.stage}</li>
          <li><strong>Funding Stage:</strong> ${formData.funding}</li>
          <li><strong>Website:</strong> ${formData.website}</li>
        </ul>

        <h3>Contact Information</h3>
        <ul>
          <li><strong>Founder/CEO:</strong> ${formData.founderName}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Phone:</strong> ${formData.phone}</li>
        </ul>

        <h3>Business Details</h3>
        <h4>Problem Statement</h4>
        <p>${formData.problem}</p>

        <h4>Solution</h4>
        <p>${formData.solution}</p>

        <p><strong>Submission Date:</strong> ${formData.submissionDate}</p>
      `;
    } else if (userType === 'partner') {
      subject = 'New Partner Application - TechGetAfrica';
      emailContent = `
        <h2>New Partner Application</h2>
        <p>A new partner application has been submitted:</p>
        
        <h3>Company Information</h3>
        <ul>
          <li><strong>Company Name:</strong> ${formData.companyName}</li>
          <li><strong>Partnership Type:</strong> ${formData.partnershipType}</li>
          <li><strong>Industry:</strong> ${formData.industry}</li>
          <li><strong>Company Size:</strong> ${formData.companySize}</li>
          <li><strong>Website:</strong> ${formData.website}</li>
        </ul>

        <h3>Contact Information</h3>
        <ul>
          <li><strong>Contact Person:</strong> ${formData.contactName}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Phone:</strong> ${formData.phone}</li>
        </ul>

        <h3>Additional Information</h3>
        <p>${formData.message}</p>

        <p><strong>Submission Date:</strong> ${formData.submissionDate}</p>
      `;
    } else if (userType === 'student') {
      subject = 'New Student Registration - TechGetAfrica';
      emailContent = `
        <h2>New Student Registration</h2>
        <p>A new student has registered:</p>
        <ul>
          <li><strong>Name:</strong> ${formData.name}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Experience Level:</strong> ${formData.experienceLevel}</li>
          <li><strong>Career Goals:</strong> ${formData.careerGoals}</li>
          <li><strong>Timeline:</strong> ${formData.timeline}</li>
        </ul>
      `;
    } else if (userType === 'institution') {
      subject = 'New Institution Registration - TechGetAfrica';
      emailContent = `
        <h2>New Institution Registration</h2>
        <p>A new institution has registered:</p>
        <ul>
          <li><strong>Institution Name:</strong> ${formData.name}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Institution Type:</strong> ${formData.institutionType}</li>
          <li><strong>Number of Students:</strong> ${formData.studentCount}</li>
          <li><strong>Areas of Focus:</strong> ${formData.areasOfFocus.join(', ')}</li>
        </ul>
      `;
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'reaganenochowiti@techgetafrica.com',
      subject: subject,
      text: emailContent.replace(/<[^>]*>/g, ''), // Plain text version
      html: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 