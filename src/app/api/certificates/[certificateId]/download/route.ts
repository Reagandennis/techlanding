import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateCertificatePDF } from "@/lib/certificate-generator";

export async function GET(
  req: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, name: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Find the certificate and verify ownership
    const certificate = await db.certificate.findFirst({
      where: {
        id: params.certificateId,
        userId: user.id,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!certificate) {
      return new NextResponse("Certificate not found", { status: 404 });
    }

    // Prepare certificate data
    const certificateData = {
      studentName: certificate.user.name || user.name || 'Student',
      courseTitle: certificate.course.title,
      instructorName: certificate.course.instructor?.name || 'Instructor',
      completionDate: certificate.issuedAt.toISOString(),
      certificateNumber: certificate.certificateNumber,
      courseDuration: certificate.course.duration || 0,
      courseLevel: certificate.course.level || 'BEGINNER',
      organizationName: 'TechGetAfrica',
    };

    // Generate PDF
    const pdfBuffer = generateCertificatePDF(certificateData);

    // Create filename
    const fileName = `${certificateData.studentName.replace(/\s+/g, '_')}_Certificate_${certificate.certificateNumber}.pdf`;

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error("[CERTIFICATE_DOWNLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'generate_preview') {
      // Get user from database
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, name: true }
      });

      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }

      // Find the certificate and verify ownership
      const certificate = await db.certificate.findFirst({
        where: {
          id: params.certificateId,
          userId: user.id,
        },
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!certificate) {
        return new NextResponse("Certificate not found", { status: 404 });
      }

      // Prepare certificate data
      const certificateData = {
        studentName: certificate.user.name || user.name || 'Student',
        courseTitle: certificate.course.title,
        instructorName: certificate.course.instructor?.name || 'Instructor',
        completionDate: certificate.issuedAt.toISOString(),
        certificateNumber: certificate.certificateNumber,
        courseDuration: certificate.course.duration || 0,
        courseLevel: certificate.course.level || 'BEGINNER',
        organizationName: 'TechGetAfrica',
      };

      // Generate PDF
      const pdfBuffer = generateCertificatePDF(certificateData);

      // Return PDF as base64 for preview
      const base64PDF = Buffer.from(pdfBuffer).toString('base64');
      
      return NextResponse.json({
        success: true,
        pdfData: `data:application/pdf;base64,${base64PDF}`,
        fileName: `${certificateData.studentName.replace(/\s+/g, '_')}_Certificate_${certificate.certificateNumber}.pdf`,
      });
    }

    return new NextResponse("Invalid action", { status: 400 });

  } catch (error) {
    console.error("[CERTIFICATE_PREVIEW_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}