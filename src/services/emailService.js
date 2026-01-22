// Email service using Vercel Serverless Functions + Resend
// Emails are sent server-side for security

/**
 * Get the API URL based on environment
 * In development: use the Vercel preview URL or skip
 * In production: use the production URL
 */
function getApiUrl() {
    // Check for explicitly configured URL first
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // In production on Vercel, API is at same domain
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return '';  // Same-origin API
    }

    // Local development - skip emails
    return null;
}

/**
 * Send order confirmation emails via Vercel API
 * @param {Object} order - The order data
 */
export async function sendOrderEmails(order) {
    const apiUrl = getApiUrl();

    if (apiUrl === null) {
        console.log('Email API not available in development - skipping emails');
        console.log('Order data:', order);
        return { success: false, reason: 'development_mode' };
    }

    try {
        const response = await fetch(`${apiUrl}/api/send-order-emails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send emails');
        }

        const result = await response.json();
        console.log('Order emails sent successfully:', result);
        return { success: true, ...result };

    } catch (error) {
        console.error('Failed to send order emails:', error);
        // Don't throw - we don't want email failure to break the order
        return { success: false, error: error.message };
    }
}

// Legacy exports for backwards compatibility
export const sendOrderConfirmation = sendOrderEmails;
export const sendAdminNotification = () => Promise.resolve();
