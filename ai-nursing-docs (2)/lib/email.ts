import sgMail from "@sendgrid/mail"

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export class EmailService {
  static async sendSOAPNote(data: {
    to: string
    nurseName: string
    callSid: string
    callDate: Date
    soapNote: string
    nursePhone: string
  }): Promise<void> {
    try {
      const htmlContent = this.generateSOAPEmailHTML(data)
      const textContent = this.generateSOAPEmailText(data)

      const msg = {
        to: data.to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL!, // Your verified sender email
          name: "NurseDoc AI",
        },
        subject: `SOAP Note Generated - Call ${data.callSid.substring(0, 8)}`,
        text: textContent,
        html: htmlContent,
        attachments: [
          {
            content: Buffer.from(data.soapNote).toString("base64"),
            filename: `SOAP_Note_${data.callSid}_${new Date().toISOString().split("T")[0]}.txt`,
            type: "text/plain",
            disposition: "attachment",
          },
        ],
      }

      await sgMail.send(msg)
      console.log("SOAP note email sent to:", data.to)
    } catch (error) {
      console.error("Error sending SOAP note email:", error)
      throw error
    }
  }

  static async sendWelcomeEmail(data: {
    to: string
    firstName: string
    twilioPhone: string
    planType: string
  }): Promise<void> {
    try {
      const msg = {
        to: data.to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL!, // Your verified sender email
          name: "NurseDoc AI",
        },
        subject: "Welcome to NurseDoc AI - Your Professional Phone Number is Ready!",
        html: this.generateWelcomeEmailHTML(data),
        text: this.generateWelcomeEmailText(data),
      }

      await sgMail.send(msg)
      console.log("Welcome email sent to:", data.to)
    } catch (error) {
      console.error("Error sending welcome email:", error)
      throw error
    }
  }

  private static generateSOAPEmailHTML(data: {
    nurseName: string
    callSid: string
    callDate: Date
    soapNote: string
    nursePhone: string
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOAP Note Generated</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .info-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 30px; border-radius: 5px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .info-label { font-weight: bold; color: #555; }
        .soap-note { background: white; border: 2px solid #e9ecef; border-radius: 10px; padding: 30px; margin: 30px 0; }
        .soap-note pre { white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5; margin: 0; }
        .instructions { background: #e8f4fd; border: 1px solid #bee5eb; border-radius: 10px; padding: 25px; margin: 30px 0; }
        .instructions h3 { color: #0c5460; margin-top: 0; }
        .instructions ol { padding-left: 20px; }
        .instructions li { margin-bottom: 8px; }
        .footer { text-align: center; padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 30px; }
        .footer p { margin: 5px 0; color: #666; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .btn:hover { background: #5a6fd8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 SOAP Note Generated</h1>
        <p>Your AI-powered nursing documentation is ready</p>
    </div>

    <div class="info-card">
        <div class="info-row">
            <span class="info-label">Nurse:</span>
            <span>${data.nurseName}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Call ID:</span>
            <span>${data.callSid}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Date/Time:</span>
            <span>${data.callDate.toLocaleString()}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Professional Line:</span>
            <span>${data.nursePhone}</span>
        </div>
    </div>

    <div class="soap-note">
        <pre>${data.soapNote}</pre>
    </div>

    <div class="instructions">
        <h3>📋 How to Use Your SOAP Note</h3>
        <ol>
            <li><strong>Review for Accuracy:</strong> Carefully review the generated SOAP note for clinical accuracy</li>
            <li><strong>Make Edits:</strong> Add any additional details or corrections as needed</li>
            <li><strong>Copy & Paste:</strong> Copy the SOAP note and paste it directly into your EHR system</li>
            <li><strong>Save for Records:</strong> Keep this email for your documentation records</li>
        </ol>
        <p><strong>Note:</strong> This SOAP note was generated using AI and should be reviewed for clinical accuracy before use in patient care documentation.</p>
    </div>

    <div class="footer">
        <p><strong>NurseDoc AI</strong></p>
        <p>Transforming nursing documentation with artificial intelligence</p>
        <p>Questions? Contact support at support@nursedoc.ai</p>
        <a href="${process.env.APP_URL}/dashboard" class="btn">View Dashboard</a>
        <a href="${process.env.APP_URL}/support" class="btn">Get Support</a>
    </div>
</body>
</html>
    `
  }

  private static generateSOAPEmailText(data: {
    nurseName: string
    callSid: string
    callDate: Date
    soapNote: string
    nursePhone: string
  }): string {
    return `
SOAP NOTE GENERATED - NurseDoc AI

Nurse: ${data.nurseName}
Call ID: ${data.callSid}
Date/Time: ${data.callDate.toLocaleString()}
Professional Line: ${data.nursePhone}

SOAP NOTE:
${data.soapNote}

INSTRUCTIONS:
1. Review the SOAP note for clinical accuracy
2. Make any necessary edits or additions
3. Copy and paste into your EHR system
4. Save this email for your records

This SOAP note was generated using AI and should be reviewed before use.

NurseDoc AI - Transforming nursing documentation
Visit your dashboard: ${process.env.APP_URL}/dashboard
    `
  }

  private static generateWelcomeEmailHTML(data: {
    firstName: string
    twilioPhone: string
    planType: string
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to NurseDoc AI</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .phone-number { background: #e8f4fd; border: 2px solid #667eea; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0; }
        .phone-number h2 { color: #667eea; margin-top: 0; }
        .phone-display { font-size: 24px; font-weight: bold; color: #333; margin: 15px 0; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Welcome to NurseDoc AI!</h1>
        <p>Your professional nursing documentation system is ready</p>
    </div>

    <p>Hi ${data.firstName},</p>

    <p>Congratulations! Your NurseDoc AI account is now active and ready to transform your nursing documentation workflow.</p>

    <div class="phone-number">
        <h2>📞 Your Professional Phone Number</h2>
        <div class="phone-display">${data.twilioPhone}</div>
        <p>Share this number with patients and families for nursing consultations</p>
    </div>

    <h3>🚀 Getting Started</h3>
    <ol>
        <li>Share your professional phone number with patients</li>
        <li>When patients call, the call will be forwarded to your personal phone</li>
        <li>All calls are automatically recorded and processed</li>
        <li>You'll receive SOAP notes via email within 5 minutes</li>
        <li>Copy and paste the SOAP notes into your EHR system</li>
    </ol>

    <p>Your ${data.planType} plan includes a 14-day free trial. No charges until your trial ends.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL}/dashboard" class="btn">Access Your Dashboard</a>
        <a href="${process.env.APP_URL}/support" class="btn">Get Support</a>
    </div>

    <p>Questions? We're here to help at support@nursedoc.ai</p>

    <p>Welcome to the future of nursing documentation!</p>

    <p>The NurseDoc AI Team</p>
</body>
</html>
    `
  }

  private static generateWelcomeEmailText(data: {
    firstName: string
    twilioPhone: string
    planType: string
  }): string {
    return `
Welcome to NurseDoc AI!

Hi ${data.firstName},

Your professional nursing documentation system is now ready!

Your Professional Phone Number: ${data.twilioPhone}

Getting Started:
1. Share your professional phone number with patients
2. When patients call, calls are forwarded to your personal phone
3. All calls are automatically recorded and processed
4. You'll receive SOAP notes via email within 5 minutes
5. Copy and paste SOAP notes into your EHR system

Your ${data.planType} plan includes a 14-day free trial.

Access your dashboard: ${process.env.APP_URL}/dashboard
Get support: ${process.env.APP_URL}/support

Questions? Contact us at support@nursedoc.ai

Welcome to the future of nursing documentation!

The NurseDoc AI Team
    `
  }
}
