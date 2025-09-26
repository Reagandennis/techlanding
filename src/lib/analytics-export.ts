import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { StudentProgress, CourseAnalytics, InstructorMetrics, AdminDashboardData } from '@/types/analytics';

interface ExportData {
  title: string;
  data: any[];
  summary?: any;
  charts?: {
    title: string;
    type: 'line' | 'bar' | 'pie';
    data: any[];
  }[];
}

export class AnalyticsExportService {
  /**
   * Export student progress data to PDF
   */
  static async exportStudentProgressToPDF(
    studentProgress: StudentProgress[], 
    summary: any,
    studentName: string
  ): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Student Progress Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Student info and summary
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Student: ${studentName}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Generated: ${format(new Date(), 'PPP')}`, 20, yPosition);
    yPosition += 20;

    // Summary section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Courses: ${summary.totalCourses}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Completed Courses: ${summary.completedCourses}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Average Progress: ${summary.averageProgress.toFixed(1)}%`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total Study Time: ${Math.round(summary.totalTimeSpent / 60)} hours`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Average Engagement: ${summary.averageEngagement.toFixed(1)}%`, 20, yPosition);
    yPosition += 20;

    // Course details
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Course Progress Details', 20, yPosition);
    yPosition += 15;

    studentProgress.forEach((progress, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. Course: ${progress.courseId}`, 20, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Progress: ${progress.progressPercentage.toFixed(1)}%`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Lessons: ${progress.lessonsCompleted}/${progress.totalLessons}`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Quizzes: ${progress.quizzesPassed}/${progress.quizzesAttempted} (Avg: ${progress.averageQuizScore.toFixed(1)}%)`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Time Spent: ${Math.round(progress.totalTimeSpent / 60)} hours`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Status: ${progress.isCompleted ? 'Completed' : 'In Progress'}`, 30, yPosition);
      if (progress.isCompleted && progress.certificateIssued) {
        yPosition += 8;
        pdf.text(`Certificate: Issued`, 30, yPosition);
      }
      yPosition += 15;
    });

    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }

  /**
   * Export course analytics to PDF
   */
  static async exportCourseAnalyticsToPDF(
    courseAnalytics: CourseAnalytics[],
    summary: any,
    instructorName?: string
  ): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Course Performance Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Header info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    if (instructorName) {
      pdf.text(`Instructor: ${instructorName}`, 20, yPosition);
      yPosition += 10;
    }
    pdf.text(`Generated: ${format(new Date(), 'PPP')}`, 20, yPosition);
    yPosition += 20;

    // Summary
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Courses: ${summary.totalCourses}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total Enrollments: ${summary.totalEnrollments}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total Revenue: $${summary.totalRevenue.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Average Rating: ${summary.averageRating.toFixed(1)}/5`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Average Completion: ${summary.averageCompletion.toFixed(1)}%`, 20, yPosition);
    yPosition += 20;

    // Course details
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Course Details', 20, yPosition);
    yPosition += 15;

    courseAnalytics.forEach((course, index) => {
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${course.courseName}`, 20, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Enrollments: ${course.totalEnrollments}`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Active Students: ${course.activeStudents}`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Completion Rate: ${course.completionRate.toFixed(1)}%`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Average Rating: ${course.averageRating.toFixed(1)}/5 (${course.totalRatings} reviews)`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Revenue: $${course.revenue.toLocaleString()}`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Avg. Time to Complete: ${course.averageTimeToComplete} days`, 30, yPosition);
      yPosition += 15;
    });

    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }

  /**
   * Export admin dashboard data to PDF
   */
  static async exportAdminDashboardToPDF(dashboardData: AdminDashboardData): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Platform Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Header info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${format(new Date(), 'PPP')}`, 20, yPosition);
    yPosition += 20;

    // Platform Overview
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Platform Overview', 20, yPosition);
    yPosition += 15;

    const overview = dashboardData.overview;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Users: ${overview.totalUsers.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Active Users: ${overview.activeUsers.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total Courses: ${overview.totalCourses}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total Enrollments: ${overview.totalEnrollments.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total Revenue: $${overview.totalRevenue.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Completion Rate: ${overview.completionRate.toFixed(1)}%`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Average Rating: ${overview.averageRating.toFixed(1)}/5`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Monthly Growth Rate: ${overview.monthlyGrowthRate > 0 ? '+' : ''}${overview.monthlyGrowthRate.toFixed(1)}%`, 20, yPosition);
    yPosition += 20;

    // Top Courses
    pdf.addPage();
    yPosition = 20;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Performing Courses', 20, yPosition);
    yPosition += 15;

    dashboardData.coursePerformance.slice(0, 10).forEach((course, index) => {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${course.title}`, 20, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`   Instructor: ${course.instructorName}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`   Enrollments: ${course.enrollments} | Revenue: $${course.revenue.toLocaleString()}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`   Rating: ${course.rating.toFixed(1)}/5 | Completion: ${course.completionRate.toFixed(1)}%`, 20, yPosition);
      yPosition += 12;

      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
    });

    // Top Instructors
    if (yPosition > 150) {
      pdf.addPage();
      yPosition = 20;
    } else {
      yPosition += 10;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Instructors', 20, yPosition);
    yPosition += 15;

    dashboardData.instructorRankings.slice(0, 10).forEach((instructor, index) => {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${instructor.name}`, 20, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`   Revenue: $${instructor.totalRevenue.toLocaleString()} | Students: ${instructor.totalStudents}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`   Courses: ${instructor.coursesCount} | Rating: ${instructor.averageRating.toFixed(1)}/5`, 20, yPosition);
      yPosition += 12;

      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
    });

    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }

  /**
   * Export data to Excel
   */
  static async exportToExcel(exportData: ExportData): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    if (exportData.summary) {
      const summaryData = Object.entries(exportData.summary).map(([key, value]) => ({
        Metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        Value: value
      }));

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
    }

    // Main data sheet
    const dataWorksheet = XLSX.utils.json_to_sheet(exportData.data);
    XLSX.utils.book_append_sheet(workbook, dataWorksheet, 'Data');

    // Chart data sheets
    if (exportData.charts) {
      exportData.charts.forEach((chart, index) => {
        const chartWorksheet = XLSX.utils.json_to_sheet(chart.data);
        XLSX.utils.book_append_sheet(workbook, chartWorksheet, `Chart_${index + 1}_${chart.title.replace(/\s+/g, '_')}`);
      });
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /**
   * Export student progress to Excel
   */
  static async exportStudentProgressToExcel(
    studentProgress: StudentProgress[],
    summary: any,
    studentName: string
  ): Promise<Blob> {
    const exportData: ExportData = {
      title: `Student Progress Report - ${studentName}`,
      data: studentProgress.map(progress => ({
        'Course ID': progress.courseId,
        'Enrollment Date': format(new Date(progress.enrollmentDate), 'PP'),
        'Progress %': progress.progressPercentage,
        'Lessons Completed': `${progress.lessonsCompleted}/${progress.totalLessons}`,
        'Quiz Score Average': progress.averageQuizScore,
        'Quizzes Passed': `${progress.quizzesPassed}/${progress.quizzesAttempted}`,
        'Time Spent (hours)': Math.round(progress.totalTimeSpent / 60),
        'Status': progress.isCompleted ? 'Completed' : 'In Progress',
        'Certificate Issued': progress.certificateIssued ? 'Yes' : 'No',
        'Engagement Score': progress.engagementScore,
        'Last Access': format(new Date(progress.lastAccessDate), 'PP')
      })),
      summary: {
        ...summary,
        'Student Name': studentName,
        'Report Generated': format(new Date(), 'PP')
      }
    };

    return this.exportToExcel(exportData);
  }

  /**
   * Export course analytics to Excel
   */
  static async exportCourseAnalyticsToExcel(
    courseAnalytics: CourseAnalytics[],
    summary: any,
    instructorName?: string
  ): Promise<Blob> {
    const exportData: ExportData = {
      title: `Course Performance Report${instructorName ? ` - ${instructorName}` : ''}`,
      data: courseAnalytics.map(course => ({
        'Course Name': course.courseName,
        'Instructor': course.instructorName,
        'Total Enrollments': course.totalEnrollments,
        'Active Students': course.activeStudents,
        'Completion Rate %': course.completionRate,
        'Average Rating': course.averageRating,
        'Total Ratings': course.totalRatings,
        'Revenue ($)': course.revenue,
        'Avg Time to Complete (days)': course.averageTimeToComplete,
        'Last Updated': format(new Date(course.lastUpdated), 'PP')
      })),
      summary: {
        ...summary,
        ...(instructorName && { 'Instructor Name': instructorName }),
        'Report Generated': format(new Date(), 'PP')
      }
    };

    return this.exportToExcel(exportData);
  }

  /**
   * Generate CSV from data
   */
  static generateCSV(data: any[], filename: string = 'export.csv'): Blob {
    if (!data.length) return new Blob([''], { type: 'text/csv' });

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Download blob as file
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}