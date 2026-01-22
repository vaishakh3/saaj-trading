const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Admin email for notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@saajtrading.com';

/**
 * Send order confirmation email to customer
 */
exports.sendOrderEmails = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        // Only allow POST
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const order = req.body;

            if (!order || !order.customer || !order.customer.email) {
                return res.status(400).json({ error: 'Invalid order data' });
            }

            // Format order items for email
            const itemsList = order.items
                .map(item => `• ${item.name} × ${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}`)
                .join('\n');

            // Send customer confirmation email
            const customerEmail = await resend.emails.send({
                from: FROM_EMAIL,
                to: order.customer.email,
                subject: `Order Confirmation - ${order.orderId}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366F1, #EC4899); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Thank You for Your Order!</h1>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <p>Hi <strong>${order.customer.name}</strong>,</p>
              <p>Your order has been received and is being processed.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #6366F1;">Order #${order.orderId}</h3>
                <pre style="font-family: inherit; white-space: pre-wrap;">${itemsList}</pre>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;">
                <p style="font-size: 18px; font-weight: bold; text-align: right;">
                  Total: ₹${order.total.toLocaleString()}
                </p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h4 style="margin-top: 0;">Delivery Address:</h4>
                <p style="margin: 0; color: #64748b;">${order.customer.address}</p>
                <p style="margin: 10px 0 0; color: #64748b;">Phone: ${order.customer.phone}</p>
              </div>
              
              <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
                We'll contact you shortly to confirm delivery details and payment.
              </p>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
              <p>Saaj Trading Company - Wholesale Toy Distributor</p>
            </div>
          </div>
        `,
            });

            // Send admin notification email
            const adminEmail = await resend.emails.send({
                from: FROM_EMAIL,
                to: ADMIN_EMAIL,
                subject: `🛒 New Order - ${order.orderId}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #6366F1;">New Order Received!</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order #${order.orderId}</h3>
              
              <h4>Customer Details:</h4>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Name:</strong> ${order.customer.name}</li>
                <li><strong>Email:</strong> ${order.customer.email}</li>
                <li><strong>Phone:</strong> ${order.customer.phone}</li>
                <li><strong>Address:</strong> ${order.customer.address}</li>
              </ul>
              
              <h4>Order Items:</h4>
              <pre style="font-family: inherit; white-space: pre-wrap;">${itemsList}</pre>
              
              <p style="font-size: 20px; font-weight: bold; color: #6366F1;">
                Total: ₹${order.total.toLocaleString()}
              </p>
            </div>
          </div>
        `,
            });

            console.log('Emails sent:', { customerEmail, adminEmail });

            return res.status(200).json({
                success: true,
                customerEmailId: customerEmail.id,
                adminEmailId: adminEmail.id
            });

        } catch (error) {
            console.error('Error sending emails:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});
