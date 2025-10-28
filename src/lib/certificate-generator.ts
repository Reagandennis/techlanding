import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface CertificateData {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  completionDate: string;
  certificateNumber: string;
  courseDuration: number;
  courseLevel: string;
  organizationName?: string;
}

export class CertificateGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;

  constructor() {
    // Create PDF in landscape orientation for certificate
    this.doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private addCertificateBorder() {
    // Add decorative border
    this.doc.setDrawColor(41, 128, 185); // Blue color
    this.doc.setLineWidth(2);
    
    // Outer border
    this.doc.rect(10, 10, this.pageWidth - 20, this.pageHeight - 20);
    
    // Inner decorative border
    this.doc.setLineWidth(0.5);
    this.doc.rect(15, 15, this.pageWidth - 30, this.pageHeight - 30);
    
    // Corner decorations
    const cornerSize = 15;
    this.doc.setFillColor(41, 128, 185);
    
    // Top-left corner
    this.doc.circle(25, 25, cornerSize / 2, 'F');
    // Top-right corner  
    this.doc.circle(this.pageWidth - 25, 25, cornerSize / 2, 'F');
    // Bottom-left corner
    this.doc.circle(25, this.pageHeight - 25, cornerSize / 2, 'F');
    // Bottom-right corner
    this.doc.circle(this.pageWidth - 25, this.pageHeight - 25, cornerSize / 2, 'F');
  }

  private addHeaderAndLogo() {
    // Add organization logo placeholder (you can replace with actual logo)
    this.doc.setFillColor(41, 128, 185);
    this.doc.circle(this.pageWidth / 2, 40, 10, 'F');
    
    // Organization name
    this.doc.setTextColor(41, 128, 185);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TechGetAfrica', this.pageWidth / 2, 60, { align: 'center' });
    
    // Subtitle
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Leading Technology Education Platform in Africa', this.pageWidth / 2, 67, { align: 'center' });
  }

  private addCertificateTitle() {
    // Certificate title
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(28);
    this.doc.setFont('times', 'bold');
    this.doc.text('CERTIFICATE OF COMPLETION', this.pageWidth / 2, 90, { align: 'center' });
    
    // Decorative line under title
    this.doc.setDrawColor(41, 128, 185);
    this.doc.setLineWidth(1);
    this.doc.line(this.pageWidth / 2 - 50, 95, this.pageWidth / 2 + 50, 95);
  }

  private addCertificateBody(data: CertificateData) {
    const centerX = this.pageWidth / 2;
    
    // "This is to certify that" text
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    this.doc.text('This is to certify that', centerX, 115, { align: 'center' });
    
    // Student name (highlighted)
    this.doc.setFontSize(24);
    this.doc.setFont('times', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    // Add underline for student name
    const nameWidth = this.doc.getTextWidth(data.studentName);
    this.doc.text(data.studentName, centerX, 130, { align: 'center' });
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(centerX - nameWidth / 2, 133, centerX + nameWidth / 2, 133);
    
    // Has successfully completed text
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    this.doc.text('has successfully completed the course', centerX, 145, { align: 'center' });
    
    // Course title (highlighted)
    this.doc.setFontSize(20);
    this.doc.setFont('times', 'bold');
    this.doc.setTextColor(41, 128, 185);
    
    // Handle long course titles by wrapping text
    const courseLines = this.doc.splitTextToSize(data.courseTitle, this.pageWidth - 80);
    this.doc.text(courseLines, centerX, 160, { align: 'center' });
    
    // Course details
    const detailsY = 160 + (courseLines.length * 8);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(80, 80, 80);
    
    const courseDetails = `Duration: ${data.courseDuration} hours | Level: ${data.courseLevel}`;
    this.doc.text(courseDetails, centerX, detailsY + 10, { align: 'center' });
    
    // Completion date
    this.doc.setFontSize(12);
    this.doc.setTextColor(60, 60, 60);
    const formattedDate = format(new Date(data.completionDate), 'MMMM dd, yyyy');
    this.doc.text(`Completed on ${formattedDate}`, centerX, detailsY + 25, { align: 'center' });
  }

  private addSignatureAndSeals(data: CertificateData) {
    const leftX = this.pageWidth * 0.25;
    const rightX = this.pageWidth * 0.75;
    const signatureY = this.pageHeight - 60;
    
    // Instructor signature section
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(leftX - 30, signatureY, leftX + 30, signatureY);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(data.instructorName, leftX, signatureY + 8, { align: 'center' });
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    this.doc.text('Course Instructor', leftX, signatureY + 15, { align: 'center' });
    
    // Organization seal/signature section
    this.doc.line(rightX - 30, signatureY, rightX + 30, signatureY);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(data.organizationName || 'TechGetAfrica', rightX, signatureY + 8, { align: 'center' });
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    this.doc.text('Authorized Representative', rightX, signatureY + 15, { align: 'center' });
    
    // Add official seal placeholder
    this.doc.setDrawColor(41, 128, 185);
    this.doc.setFillColor(41, 128, 185, 0.1);
    this.doc.circle(rightX, signatureY - 15, 15, 'FD');
    this.doc.setFontSize(8);
    this.doc.setTextColor(41, 128, 185);
    this.doc.text('OFFICIAL', rightX, signatureY - 18, { align: 'center' });
    this.doc.text('SEAL', rightX, signatureY - 12, { align: 'center' });
  }

  private addCertificateNumber(certificateNumber: string) {
    // Certificate number at bottom
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(120, 120, 120);
    this.doc.text(`Certificate ID: ${certificateNumber}`, this.pageWidth / 2, this.pageHeight - 20, { align: 'center' });
    
    // Verification text
    this.doc.setFontSize(8);
    this.doc.text('This certificate can be verified at techgetafrica.com/verify', this.pageWidth / 2, this.pageHeight - 15, { align: 'center' });
  }

  private addWatermark() {
    // Add subtle watermark
    this.doc.setTextColor(240, 240, 240);
    this.doc.setFontSize(40);
    this.doc.setFont('helvetica', 'bold');
    
    // Rotate text for watermark effect
    this.doc.text('TECHGETAFRICA', this.pageWidth / 2, this.pageHeight / 2, { 
      align: 'center',
      angle: -45
    });
  }

  public generateCertificate(data: CertificateData): Uint8Array {
    // Add all certificate elements
    this.addWatermark();
    this.addCertificateBorder();
    this.addHeaderAndLogo();
    this.addCertificateTitle();
    this.addCertificateBody(data);
    this.addSignatureAndSeals(data);
    this.addCertificateNumber(data.certificateNumber);
    
    // Return PDF as buffer
    return this.doc.output('arraybuffer') as Uint8Array;
  }

  public async downloadCertificate(data: CertificateData, filename?: string): Promise<void> {
    this.generateCertificate(data);
    
    const fileName = filename || `${data.studentName.replace(/\s+/g, '_')}_Certificate_${data.certificateNumber}.pdf`;
    this.doc.save(fileName);
  }

  public getCertificateBlob(data: CertificateData): Blob {
    const pdfBuffer = this.generateCertificate(data);
    return new Blob([pdfBuffer], { type: 'application/pdf' });
  }
}

// Export utility functions
export const generateCertificatePDF = (data: CertificateData): Uint8Array => {
  const generator = new CertificateGenerator();
  return generator.generateCertificate(data);
};

export const downloadCertificatePDF = async (data: CertificateData, filename?: string): Promise<void> => {
  const generator = new CertificateGenerator();
  return generator.downloadCertificate(data, filename);
};

export const getCertificateBlob = (data: CertificateData): Blob => {
  const generator = new CertificateGenerator();
  return generator.getCertificateBlob(data);
};