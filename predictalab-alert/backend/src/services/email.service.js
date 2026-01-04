const nodemailer = require('nodemailer');

/**
 * Email Service for sending notifications to ATO and TO
 */
class EmailService {
    constructor() {
        // Configure email transporter
        // For production, use environment variables for credentials
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || ''
            }
        });
    }

    /**
     * Send alert email to ATO and TO workers
     * @param {Object} machine - Machine object with details
     * @param {Array} recipients - Array of worker objects with email/contact
     * @param {String} alertType - 'ALERT' or 'CRITICAL'
     */
    async sendAlertEmail(machine, recipients, alertType) {
        try {
            const subject = `🚨 ${alertType} Alert: ${machine.Machine_Name} at ${machine.iti?.Name || 'ITI'}`;

            const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: ${alertType === 'CRITICAL' ? '#dc3545' : '#ffc107'};">
            ${alertType} Machine Alert
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Machine Details:</h3>
            <p><strong>Machine Name:</strong> ${machine.Machine_Name}</p>
            <p><strong>Model No:</strong> ${machine.Model_No}</p>
            <p><strong>Type:</strong> ${machine.Type}</p>
            <p><strong>Status:</strong> <span style="color: ${alertType === 'CRITICAL' ? '#dc3545' : '#ffc107'}; font-weight: bold;">${alertType}</span></p>
            <p><strong>Faults Count:</strong> ${machine.Faults}</p>
          </div>

          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>ITI Information:</h3>
            <p><strong>ITI Name:</strong> ${machine.iti?.Name || 'N/A'}</p>
            <p><strong>Location:</strong> ${machine.iti?.City || ''}, ${machine.iti?.State || ''}</p>
            <p><strong>Address:</strong> ${machine.iti?.Address || 'N/A'}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
            <p><strong>Action Required:</strong> Please review the machine status and take appropriate maintenance action.</p>
            <p>A maintenance log has been automatically created in the system.</p>
          </div>

          <p style="margin-top: 20px; color: #6c757d; font-size: 12px;">
            This is an automated alert from the Predictive Maintenance System.
          </p>
        </div>
      `;

            const textContent = `
${alertType} ALERT: ${machine.Machine_Name}

Machine Details:
- Machine Name: ${machine.Machine_Name}
- Model No: ${machine.Model_No}
- Type: ${machine.Type}
- Status: ${alertType}
- Faults Count: ${machine.Faults}

ITI Information:
- ITI Name: ${machine.iti?.Name || 'N/A'}
- Location: ${machine.iti?.City || ''}, ${machine.iti?.State || ''}
- Address: ${machine.iti?.Address || 'N/A'}

Action Required: Please review the machine status and take appropriate maintenance action.
A maintenance log has been automatically created in the system.

This is an automated alert from the Predictive Maintenance System.
      `;

            // Send email to each recipient
            const emailPromises = recipients.map(recipient => {
                // Use Contact field as email if available, or construct from name
                const email = recipient.Contact?.includes('@')
                    ? recipient.Contact
                    : `${recipient.Name?.toLowerCase().replace(/\s+/g, '.')}@iti.com` || 'admin@iti.com';

                return this.transporter.sendMail({
                    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@predictalab.com',
                    to: email,
                    subject: subject,
                    text: textContent,
                    html: htmlContent
                });
            });

            await Promise.all(emailPromises);
            console.log(`✅ Alert emails sent to ${recipients.length} recipients for machine ${machine.Machine_ID}`);

            return { success: true, sent: recipients.length };
        } catch (error) {
            console.error('❌ Error sending alert email:', error);
            // Don't throw error - email failure shouldn't stop the monitoring process
            return { success: false, error: error.message };
        }
    }

    /**
     * Test email configuration
     */
    async testEmailConfig() {
        try {
            await this.transporter.verify();
            console.log('✅ Email server is ready to send messages');
            return true;
        } catch (error) {
            console.error('❌ Email server configuration error:', error);
            return false;
        }
    }
}

module.exports = new EmailService();

