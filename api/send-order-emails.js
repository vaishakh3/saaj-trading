import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const order = req.body;

        if (!order || !order.customer || !order.customer.email) {
            return res.status(400).json({ error: 'Invalid order data' });
        }

        // Format order items
        const itemsList = order.items
            .map(item => `• ${item.name} × ${item.quantity} - ₹${((item.price || 0) * item.quantity).toLocaleString('en-IN')}`)
            .join('\n');

        // Send customer email
        const customerEmail = await resend.emails.send({
            from: FROM_EMAIL,
            to: order.customer.email,
            subject: `Order Confirmation - ${order.orderId}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366F1, #EC4899); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">Thank You for Your Order!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <p>Hi <strong>${order.customer.name}</strong>,</p>
            <p>Your order has been received and is being processed.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin-top: 0; color: #6366F1;">Order #${order.orderId}</h3>
              <pre style="font-family: inherit; white-space: pre-wrap; margin: 0;">${itemsList}</pre>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;">
              <p style="font-size: 18px; font-weight: bold; text-align: right; margin: 0;">
                Total: ₹${order.total.toLocaleString('en-IN')}
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <h4 style="margin-top: 0;">Delivery Address:</h4>
              <p style="margin: 0; color: #64748b;">${order.customer.address}</p>
              <p style="margin: 10px 0 0; color: #64748b;">Phone: ${order.customer.phone}</p>
            </div>
            
            <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
              We'll contact you shortly to confirm delivery details and payment.
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; background: #1e293b; border-radius: 0 0 12px 12px;">
            <p style="margin: 0;">Saaj Trading Company - Wholesale Toy Distributor</p>
          </div>
        </div>
      `,
        });

        // Send admin notification
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
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li><strong>Name:</strong> ${order.customer.name}</li>
              <li><strong>Email:</strong> ${order.customer.email}</li>
              <li><strong>Phone:</strong> ${order.customer.phone}</li>
              <li><strong>Address:</strong> ${order.customer.address}</li>
            </ul>
            
            <h4>Order Items:</h4>
            <pre style="font-family: inherit; white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px;">${itemsList}</pre>
            
            <p style="font-size: 20px; font-weight: bold; color: #6366F1; margin-bottom: 0;">
              Total: ₹${order.total.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      `,
        });

        return res.status(200).json({
            success: true,
            customerEmailId: customerEmail.data?.id,
            adminEmailId: adminEmail.data?.id,
        });

    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: error.message });
    }
}
