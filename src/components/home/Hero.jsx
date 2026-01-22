import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Heart } from 'lucide-react';

export default function Hero() {
    const scrollToProducts = () => {
        const element = document.getElementById('products');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToContact = () => {
        const element = document.getElementById('contact');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero">
            <div className="hero-bg">
                <div className="hero-blob hero-blob-1"></div>
                <div className="hero-blob hero-blob-2"></div>
                <div className="hero-blob hero-blob-3"></div>
            </div>

            <div className="container">
                <div className="hero-content">
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1>
                            <span className="gradient-text">Premium Toys</span>
                            <br />
                            for Inspired Kids
                        </h1>
                        <p>
                            Discover our curated collection of quality toys for all ages.
                            From educational games to creative adventures, we bring joy to
                            every child's world.
                        </p>

                        <div className="hero-buttons">
                            <motion.button
                                className="btn btn-primary btn-lg"
                                onClick={scrollToProducts}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Explore Products
                                <ArrowRight size={20} />
                            </motion.button>
                            <motion.button
                                className="btn btn-secondary btn-lg"
                                onClick={scrollToContact}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Get in Touch
                            </motion.button>
                        </div>

                        <div className="hero-stats">
                            <motion.div
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="stat-value">100%</div>
                                <div className="stat-label">Quality Assured</div>
                            </motion.div>
                            <motion.div
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="stat-value">50+</div>
                                <div className="stat-label">Premium Products</div>
                            </motion.div>
                            <motion.div
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="stat-value">15+</div>
                                <div className="stat-label">Categories</div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-image"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="hero-image-wrapper">
                            <img
                                src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop"
                                alt="Colorful toy store with premium toys"
                            />
                        </div>

                        <motion.div
                            className="hero-floating hero-floating-1"
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                            }}>
                                <Sparkles size={28} color="white" />
                            </div>
                        </motion.div>

                        <motion.div
                            className="hero-floating hero-floating-2"
                            animate={{ y: [10, -10, 10] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'linear-gradient(135deg, #F59E0B, #EC4899)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
                            }}>
                                <Star size={24} color="white" />
                            </div>
                        </motion.div>

                        <motion.div
                            className="hero-floating hero-floating-3"
                            animate={{ y: [-5, 15, -5] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <div style={{
                                width: '45px',
                                height: '45px',
                                background: 'linear-gradient(135deg, #EC4899, #6366F1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)'
                            }}>
                                <Heart size={22} color="white" />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
