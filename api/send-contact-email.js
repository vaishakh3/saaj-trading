import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { firstName, lastName, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!firstName || !email || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'vichured@gmail.com';
        const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

        // Send email to admin
        const { data, error } = await resend.emails.send({
            from: `Saaj Trading Contact <${fromEmail}>`,
            to: adminEmail,
            subject: `New Contact: ${subject || 'Website Inquiry'}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">📬 New Contact Form Submission</h1>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #eee;">
                                <h2 style="color: #6366F1; margin: 0 0 16px 0; font-size: 18px;">Contact Details</h2>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Name:</strong></td>
                                        <td style="padding: 8px 0; color: #333;">${firstName} ${lastName || ''}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                                        <td style="padding: 8px 0; color: #333;"><a href="mailto:${email}" style="color: #6366F1;">${email}</a></td>
                                    </tr>
                                    ${phone ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                                        <td style="padding: 8px 0; color: #333;"><a href="tel:${phone}" style="color: #6366F1;">${phone}</a></td>
                                    </tr>
                                    ` : ''}
                                    ${subject ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;"><strong>Subject:</strong></td>
                                        <td style="padding: 8px 0; color: #333;">${subject}</td>
                                    </tr>
                                    ` : ''}
                                </table>
                            </div>
                            
                            <div style="margin-bottom: 24px;">
                                <h2 style="color: #6366F1; margin: 0 0 16px 0; font-size: 18px;">Message</h2>
                                <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #6366F1;">
                                    <p style="color: #333; margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
                                </div>
                            </div>
                            
                            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                                <a href="mailto:${email}?subject=Re: ${subject || 'Your inquiry to Saaj Trading'}" 
                                   style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                                    Reply to ${firstName}
                                </a>
                            </div>
                        </div>
                        
                        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                            This message was sent from the contact form on www.saajtradingcompany.in
                        </p>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: 'Failed to send email', details: error.message });
        }

        return res.status(200).json({
            success: true,
            emailId: data.id,
            message: 'Contact form submitted successfully'
        });

    } catch (error) {
        console.error('Contact email error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
