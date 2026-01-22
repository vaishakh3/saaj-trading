import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ShoppingBag, Package, CheckCircle, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';

export default function Checkout() {
    const navigate = useNavigate();
    const { items, subtotal, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm();

    // Generate order number
    const generateOrderNumber = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `SAAJ-${timestamp}${random}`;
    };

    const onSubmit = async (data) => {
        if (items.length === 0) {
            toast.error('Your cart is empty!');
            return;
        }

        setIsSubmitting(true);
        const newOrderNumber = generateOrderNumber();

        try {
            // Prepare order data
            const orderData = {
                orderId: newOrderNumber,
                customer: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                },
                items: items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl,
                })),
                subtotal,
                total: subtotal, // Can add shipping/tax later
                status: 'pending',
                createdAt: serverTimestamp(),
            };

            // Save order to Firestore
            if (db) {
                await addDoc(collection(db, 'orders'), orderData);

                // Update inventory counts for each item
                for (const item of items) {
                    try {
                        const itemRef = doc(db, 'inventory', item.id);
                        await updateDoc(itemRef, {
                            count: increment(-item.quantity)
                        });
                    } catch (inventoryError) {
                        console.error(`Failed to update inventory for ${item.name}:`, inventoryError);
                        // Continue with other items even if one fails
                    }
                }
            }

            // Send confirmation emails (via Cloud Function + Resend)
            try {
                const { sendOrderEmails } = await import('../services/emailService');
                await sendOrderEmails(orderData);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't fail the order if email fails
            }

            setOrderNumber(newOrderNumber);
            setOrderComplete(true);
            clearCart();
            toast.success('Order placed successfully!');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Order Complete Screen
    if (orderComplete) {
        return (
            <div className="checkout-page">
                <div className="container">
                    <motion.div
                        className="order-success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="success-icon">
                            <CheckCircle size={80} />
                        </div>
                        <h1>Thank You!</h1>
                        <p className="success-message">Your order has been placed successfully.</p>
                        <div className="order-number-box">
                            <span>Order Number</span>
                            <strong>{orderNumber}</strong>
                        </div>
                        <p className="success-email">
                            A confirmation email has been sent to your email address.
                        </p>
                        <div className="success-actions">
                            <button className="btn btn-primary" onClick={() => navigate('/products')}>
                                Continue Shopping
                            </button>
                            <button className="btn btn-secondary" onClick={() => navigate('/')}>
                                Back to Home
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Empty Cart
    if (items.length === 0) {
        return (
            <div className="checkout-page">
                <div className="container">
                    <motion.div
                        className="checkout-empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <ShoppingBag size={80} strokeWidth={1} />
                        <h2>Your cart is empty</h2>
                        <p>Add some products to your cart before checkout.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/products')}>
                            Browse Products
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Back Button */}
                    <button className="checkout-back" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        Back
                    </button>

                    <h1 className="checkout-title">Checkout</h1>

                    <div className="checkout-content">
                        {/* Customer Details Form */}
                        <div className="checkout-form-section">
                            <h2>Customer Details</h2>
                            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="name">Full Name *</label>
                                    <input
                                        id="name"
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter your full name"
                                        {...register('name', { required: 'Full name is required' })}
                                    />
                                    {errors.name && (
                                        <span className="form-error">{errors.name.message}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="email">Email Address *</label>
                                    <input
                                        id="email"
                                        type="email"
                                        className="form-input"
                                        placeholder="your.email@example.com"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address',
                                            },
                                        })}
                                    />
                                    {errors.email && (
                                        <span className="form-error">{errors.email.message}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="phone">Phone Number *</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        className="form-input"
                                        placeholder="+91 98765 43210"
                                        {...register('phone', { required: 'Phone number is required' })}
                                    />
                                    {errors.phone && (
                                        <span className="form-error">{errors.phone.message}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="address">Delivery Address *</label>
                                    <textarea
                                        id="address"
                                        className="form-textarea"
                                        placeholder="Enter your complete delivery address"
                                        {...register('address', { required: 'Address is required' })}
                                    />
                                    {errors.address && (
                                        <span className="form-error">{errors.address.message}</span>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="checkout-summary-section">
                            <h2>Order Summary</h2>
                            <div className="checkout-items">
                                {items.map((item) => (
                                    <div key={item.id} className="checkout-item">
                                        <div className="checkout-item-image">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} />
                                            ) : (
                                                <Package size={24} />
                                            )}
                                        </div>
                                        <div className="checkout-item-details">
                                            <h4>{item.name}</h4>
                                            <p>Qty: {item.quantity}</p>
                                        </div>
                                        <div className="checkout-item-price">
                                            ₹{((item.price || 0) * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="checkout-totals">
                                <div className="checkout-total-row">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="checkout-total-row">
                                    <span>Shipping</span>
                                    <span>Calculated later</span>
                                </div>
                                <div className="checkout-total-row total">
                                    <span>Total</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                form="checkout-form"
                                className="btn btn-primary btn-lg checkout-submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="loading-spinner" style={{ width: 20, height: 20 }} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Confirm Order
                                    </>
                                )}
                            </motion.button>

                            <p className="checkout-note">
                                By placing this order, you agree to our terms and conditions.
                                Payment details will be shared via email/WhatsApp.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
