import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';

export default function Contact() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Save to Firestore as backup
            await addDoc(collection(db, 'contacts'), {
                ...data,
                createdAt: serverTimestamp(),
                read: false,
            });

            // Send email notification to admin
            const apiUrl = import.meta.env.PROD
                ? '/api/send-contact-email'
                : (import.meta.env.VITE_API_URL || '') + '/api/send-contact-email';

            try {
                await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            } catch (emailError) {
                console.error('Email notification failed:', emailError);
                // Don't fail the submission if email fails - data is saved to Firestore
            }

            toast.success('Message sent successfully! We\'ll get back to you soon.');
            reset();
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="section contact">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="section-title">
                        Get in <span className="gradient-text">Touch</span>
                    </h2>
                    <p className="section-subtitle">
                        Have questions? We'd love to hear from you. Send us a message!
                    </p>
                </motion.div>

                <div className="contact-content">
                    <motion.div
                        className="contact-info"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                            Contact Information
                        </h3>
                        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
                            Visit our store or reach out through any of the channels below.
                        </p>

                        <div className="contact-details">
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <MapPin size={20} />
                                </div>
                                <div className="contact-item-content">
                                    <h4>Our Location</h4>
                                    <p>Cheruvattoor M M Kavala<br />13-384/8, Kothamangalam, Kerala 686691</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">
                                    <Phone size={20} />
                                </div>
                                <div className="contact-item-content">
                                    <h4>Phone</h4>
                                    <p>
                                        <a href="tel:+919847511422">098475 11422</a><br />
                                        <a href="tel:+919847511488">098475 11488</a><br />
                                        <a href="tel:+914852549422">0485 254 9422</a>
                                    </p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">
                                    <Mail size={20} />
                                </div>
                                <div className="contact-item-content">
                                    <h4>Email</h4>
                                    <p><a href="mailto:saajtradingcompany@gmail.com">saajtradingcompany@gmail.com</a></p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">
                                    <Clock size={20} />
                                </div>
                                <div className="contact-item-content">
                                    <h4>Business Hours</h4>
                                    <p>Mon - Sat: 9:00 AM - 7:00 PM<br />Sunday: 10:00 AM - 5:00 PM</p>
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/919847511422?text=Hi! I'm interested in your toys."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-btn"
                        >
                            <MessageCircle size={22} />
                            Chat on WhatsApp
                        </a>

                        <div className="map-container">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9207.629831607264!2d76.581318!3d10.050756!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b07e73e0612589b%3A0xf29df6d156600ea5!2sM.M%20kavala!5e1!3m2!1sen!2sin!4v1768251259450!5m2!1sen!2sin"
                                title="Saaj Trading Company Location"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        className="contact-form-wrapper"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                            Send us a Message
                        </h3>

                        <form className="contact-form" onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="firstName">First Name</label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        className="form-input"
                                        placeholder="John"
                                        {...register('firstName', { required: 'First name is required' })}
                                    />
                                    {errors.firstName && (
                                        <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>
                                            {errors.firstName.message}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="lastName">Last Name</label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        className="form-input"
                                        placeholder="Doe"
                                        {...register('lastName', { required: 'Last name is required' })}
                                    />
                                    {errors.lastName && (
                                        <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>
                                            {errors.lastName.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    placeholder="your.email@example.com"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>
                                        {errors.email.message}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="phone">Phone Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    className="form-input"
                                    placeholder="+91 98765 43210"
                                    {...register('phone')}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="subject">Subject</label>
                                <input
                                    id="subject"
                                    type="text"
                                    className="form-input"
                                    placeholder="How can we help you?"
                                    {...register('subject', { required: 'Subject is required' })}
                                />
                                {errors.subject && (
                                    <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>
                                        {errors.subject.message}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    className="form-textarea"
                                    placeholder="Tell us about your bulk order requirements..."
                                    {...register('message', { required: 'Message is required' })}
                                />
                                {errors.message && (
                                    <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>
                                        {errors.message.message}
                                    </span>
                                )}
                            </div>

                            <motion.button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%' }}
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="loading-spinner" style={{ width: 20, height: 20 }} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Send Message
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
