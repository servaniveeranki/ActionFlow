// services/emailService.js

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // For development, we'll use a test account
    // In production, use real SMTP credentials
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    // Create a test account for development
    // In production, replace with actual SMTP credentials
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('Email service initialized with test account');
      console.log('Test account:', testAccount.user);
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      // Create a mock transporter for offline testing
      this.transporter = {
        sendMail: async (mailOptions) => {
          console.log('Mock email sent:', mailOptions);
          return { messageId: 'mock-' + Date.now() };
        }
      };
    }
  }

  async sendEmail(actionItem) {
    try {
      const { emailTo, emailSubject, emailBody } = actionItem.metadata;

      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const mailOptions = {
        from: '"Action Items System" <noreply@actionitems.com>',
        to: emailTo.join(', '),
        subject: emailSubject,
        text: emailBody,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #333;">${emailSubject}</h2>
            <p style="color: #666; line-height: 1.6;">${emailBody}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              This email was sent automatically by Action Items Management System
            </p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simulate sending email (for demo purposes)
  async sendEmailMock(actionItem) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Mock email sent to:', actionItem.metadata.emailTo);
        resolve({
          success: true,
          messageId: 'mock-' + Date.now(),
          previewUrl: 'https://example.com/mock-email'
        });
      }, 1000);
    });
  }
}

module.exports = new EmailService();