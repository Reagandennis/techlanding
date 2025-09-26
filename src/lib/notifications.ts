import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Types
export interface NotificationData {
  userId: string;
  type: 'COURSE_UPDATE' | 'ASSIGNMENT_DUE' | 'QUIZ_GRADED' | 'NEW_MESSAGE' | 'ENROLLMENT' | 'CERTIFICATE' | 'ANNOUNCEMENT' | 'REMINDER';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: 'ACADEMIC' | 'SYSTEM' | 'SOCIAL' | 'ADMINISTRATIVE';
  sendEmail?: boolean;
  emailTemplate?: string;
}

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Notification Service Class
class NotificationService {
  
  /**
   * Create and send a notification
   */
  async createNotification(data: NotificationData): Promise<string | null> {
    try {
      // Create in-app notification
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          metadata: data.metadata || {},
          priority: data.priority || 'MEDIUM',
          category: data.category || 'SYSTEM',
          isRead: false,
          createdAt: new Date()
        }
      });

      // Send email notification if requested
      if (data.sendEmail) {
        await this.sendEmailNotification(data);
      }

      return notification.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  async createBulkNotifications(userIds: string[], data: Omit<NotificationData, 'userId'>): Promise<void> {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        metadata: data.metadata || {},
        priority: data.priority || 'MEDIUM',
        category: data.category || 'SYSTEM',
        isRead: false,
        createdAt: new Date()
      }));

      await prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true
      });

      // Send bulk emails if requested
      if (data.sendEmail) {
        await Promise.all(
          userIds.map(userId => 
            this.sendEmailNotification({ ...data, userId })
          )
        );
      }
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(data: NotificationData): Promise<void> {
    try {
      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { email: true, name: true, emailPreferences: true }
      });

      if (!user?.email) {
        console.warn('User email not found for notification:', data.userId);
        return;
      }

      // Check user email preferences (if implemented)
      if (user.emailPreferences && !this.shouldSendEmail(data.type, user.emailPreferences)) {
        return;
      }

      const emailData = await this.generateEmailContent(data, user);
      await this.sendEmail(emailData);

    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  /**
   * Generate email content based on notification type
   */
  private async generateEmailContent(data: NotificationData, user: { name: string; email: string }): Promise<EmailNotificationData> {
    const baseSubject = data.title;
    const actionButton = data.actionUrl 
      ? `<a href="${data.actionUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">View Details</a>`
      : '';

    let html = '';
    
    switch (data.type) {
      case 'ASSIGNMENT_DUE':
        html = this.getAssignmentDueEmailTemplate(data, user.name, actionButton);
        break;
      case 'QUIZ_GRADED':
        html = this.getQuizGradedEmailTemplate(data, user.name, actionButton);
        break;
      case 'COURSE_UPDATE':
        html = this.getCourseUpdateEmailTemplate(data, user.name, actionButton);
        break;
      case 'ENROLLMENT':
        html = this.getEnrollmentEmailTemplate(data, user.name, actionButton);
        break;
      case 'CERTIFICATE':
        html = this.getCertificateEmailTemplate(data, user.name, actionButton);
        break;
      default:
        html = this.getGenericEmailTemplate(data, user.name, actionButton);
    }

    return {
      to: user.email,
      subject: baseSubject,
      html,
      from: process.env.FROM_EMAIL || 'noreply@yourlms.com'
    };
  }

  /**
   * Send email using Resend
   */
  private async sendEmail(data: EmailNotificationData): Promise<void> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured, skipping email notification');
        return;
      }

      await resend.emails.send({
        from: data.from || 'LMS Notifications <noreply@yourlms.com>',
        to: data.to,
        subject: data.subject,
        html: data.html
      });

      console.log('Email notification sent successfully to:', data.to);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  /**
   * Check if email should be sent based on user preferences
   */
  private shouldSendEmail(type: string, preferences: any): boolean {
    // Implement email preference logic here
    // For now, return true for all notifications
    return true;
  }

  // Email Templates
  private getAssignmentDueEmailTemplate(data: NotificationData, userName: string, actionButton: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1F2937;">Assignment Due Soon</h2>
        <p>Hi ${userName},</p>
        <p>This is a reminder that your assignment is due soon:</p>
        <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #92400E;">${data.title}</h3>
          <p style="margin: 0; color: #92400E;">${data.message}</p>
          ${data.metadata?.dueDate ? `<p style="margin: 8px 0 0 0; color: #92400E;"><strong>Due: ${new Date(data.metadata.dueDate).toLocaleDateString()}</strong></p>` : ''}
        </div>
        ${actionButton}
        <p style="margin-top: 24px; color: #6B7280; font-size: 14px;">
          Best regards,<br>
          Your LMS Team
        </p>
      </div>
    `;
  }

  private getQuizGradedEmailTemplate(data: NotificationData, userName: string, actionButton: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1F2937;">Quiz Results Available</h2>
        <p>Hi ${userName},</p>
        <p>Your quiz has been graded:</p>
        <div style="background-color: #DBEAFE; border: 1px solid #3B82F6; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1E40AF;">${data.title}</h3>
          <p style="margin: 0; color: #1E40AF;">${data.message}</p>
          ${data.metadata?.score ? `<p style="margin: 8px 0 0 0; color: #1E40AF;"><strong>Score: ${data.metadata.score}%</strong></p>` : ''}
        </div>
        ${actionButton}
        <p style="margin-top: 24px; color: #6B7280; font-size: 14px;">
          Best regards,<br>
          Your LMS Team
        </p>
      </div>
    `;
  }

  private getCourseUpdateEmailTemplate(data: NotificationData, userName: string, actionButton: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1F2937;">Course Update</h2>
        <p>Hi ${userName},</p>
        <p>There's a new update in your course:</p>
        <div style="background-color: #F0F9FF; border: 1px solid #0EA5E9; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #0369A1;">${data.title}</h3>
          <p style="margin: 0; color: #0369A1;">${data.message}</p>
          ${data.metadata?.courseName ? `<p style="margin: 8px 0 0 0; color: #0369A1;"><strong>Course: ${data.metadata.courseName}</strong></p>` : ''}
        </div>
        ${actionButton}
        <p style="margin-top: 24px; color: #6B7280; font-size: 14px;">
          Best regards,<br>
          Your LMS Team
        </p>
      </div>
    `;
  }

  private getEnrollmentEmailTemplate(data: NotificationData, userName: string, actionButton: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1F2937;">Welcome to Your New Course!</h2>
        <p>Hi ${userName},</p>
        <p>Congratulations on your enrollment:</p>
        <div style="background-color: #ECFDF5; border: 1px solid #10B981; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #047857;">${data.title}</h3>
          <p style="margin: 0; color: #047857;">${data.message}</p>
        </div>
        ${actionButton}
        <p style="margin-top: 24px; color: #6B7280; font-size: 14px;">
          Happy learning,<br>
          Your LMS Team
        </p>
      </div>
    `;
  }

  private getCertificateEmailTemplate(data: NotificationData, userName: string, actionButton: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1F2937;">🎉 Congratulations! Certificate Available</h2>
        <p>Hi ${userName},</p>
        <p>Amazing work! Your certificate is ready:</p>
        <div style="background-color: #FDF4FF; border: 1px solid #C084FC; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #7C3AED;">${data.title}</h3>
          <p style="margin: 0; color: #7C3AED;">${data.message}</p>
        </div>
        ${actionButton}
        <p style="margin-top: 24px; color: #6B7280; font-size: 14px;">
          Congratulations again,<br>
          Your LMS Team
        </p>
      </div>
    `;
  }

  private getGenericEmailTemplate(data: NotificationData, userName: string, actionButton: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1F2937;">${data.title}</h2>
        <p>Hi ${userName},</p>
        <p>${data.message}</p>
        ${actionButton}
        <p style="margin-top: 24px; color: #6B7280; font-size: 14px;">
          Best regards,<br>
          Your LMS Team
        </p>
      </div>
    `;
  }

  // Convenience methods for common notifications
  async notifyAssignmentDue(userId: string, assignmentTitle: string, courseName: string, dueDate: string, actionUrl?: string) {
    return this.createNotification({
      userId,
      type: 'ASSIGNMENT_DUE',
      title: 'Assignment Due Soon',
      message: `Your assignment "${assignmentTitle}" is due soon.`,
      actionUrl,
      metadata: { assignmentTitle, courseName, dueDate },
      priority: 'HIGH',
      category: 'ACADEMIC',
      sendEmail: true
    });
  }

  async notifyQuizGraded(userId: string, quizTitle: string, score: number, courseName: string, actionUrl?: string) {
    return this.createNotification({
      userId,
      type: 'QUIZ_GRADED',
      title: 'Quiz Results Available',
      message: `Your quiz "${quizTitle}" has been graded. Score: ${score}%`,
      actionUrl,
      metadata: { quizTitle, score, courseName },
      priority: 'MEDIUM',
      category: 'ACADEMIC',
      sendEmail: true
    });
  }

  async notifyEnrollment(userId: string, courseName: string, instructorName: string, actionUrl?: string) {
    return this.createNotification({
      userId,
      type: 'ENROLLMENT',
      title: 'Successfully Enrolled',
      message: `Welcome to "${courseName}"! You can now start learning.`,
      actionUrl,
      metadata: { courseName, instructorName },
      priority: 'MEDIUM',
      category: 'ACADEMIC',
      sendEmail: true
    });
  }

  async notifyCourseUpdate(userIds: string[], courseName: string, updateMessage: string, actionUrl?: string) {
    return this.createBulkNotifications(userIds, {
      type: 'COURSE_UPDATE',
      title: 'Course Update',
      message: updateMessage,
      actionUrl,
      metadata: { courseName },
      priority: 'MEDIUM',
      category: 'ACADEMIC',
      sendEmail: false // Usually don't send email for course updates unless important
    });
  }

  async notifyCertificateEarned(userId: string, courseName: string, actionUrl?: string) {
    return this.createNotification({
      userId,
      type: 'CERTIFICATE',
      title: 'Certificate Available!',
      message: `Congratulations! You've earned a certificate for completing "${courseName}".`,
      actionUrl,
      metadata: { courseName },
      priority: 'HIGH',
      category: 'ACADEMIC',
      sendEmail: true
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;