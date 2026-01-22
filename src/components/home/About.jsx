import { motion } from 'framer-motion';
import { Target, Eye, Heart, Shield, BookOpen, Users } from 'lucide-react';

const values = [
    {
        icon: Heart,
        title: 'Child-Centric Design',
        description: 'Every product is designed with children\'s safety and joy in mind.',
        color: '#EC4899',
    },
    {
        icon: Shield,
        title: 'Premium Quality',
        description: 'We source only the highest quality toys from trusted manufacturers.',
        color: '#8B5CF6',
    },
    {
        icon: BookOpen,
        title: 'Educational Value',
        description: 'Toys that stimulate learning, creativity, and cognitive development.',
        color: '#3B82F6',
    },
    {
        icon: Users,
        title: 'Family Focused',
        description: 'Creating moments of joy and bonding for families everywhere.',
        color: '#10B981',
    },
];

const stats = [
    { value: '100%', label: 'Quality Assured' },
    { value: '50+', label: 'Premium Products' },
    { value: 'NEW', label: 'Grand Opening' },
    { value: '15+', label: 'Curated Brands' },
];

export default function About() {
    return (
        <>
            <section id="about" className="section about">
                <div className="container">
                    <div className="about-content">
                        <motion.div
                            className="about-text"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2>
                                About <span className="gradient-text">Saaj Trading</span>
                            </h2>
                            <p>
                                Saaj Trading Company is dedicated to providing children with safe,
                                high-quality, and inspiring toys. We carefully curate every product
                                to ensure it supports creativity, learning, and fun — helping families
                                create meaningful memories together.
                            </p>

                            <div className="mission-vision">
                                <motion.div
                                    className="mission-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h3>
                                        <Target size={22} color="#6366F1" />
                                        Our Mission
                                    </h3>
                                    <p>
                                        To provide families with premium, safe, and educational toys that
                                        inspire creativity, promote learning, and create lasting memories.
                                    </p>
                                </motion.div>

                                <motion.div
                                    className="vision-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h3>
                                        <Eye size={22} color="#EC4899" />
                                        Our Vision
                                    </h3>
                                    <p>
                                        To become the most trusted destination for premium children's toys,
                                        known for our commitment to quality, safety, and educational value.
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="values-grid"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {values.map((value, index) => (
                                <motion.div
                                    key={value.title}
                                    className="value-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    style={{
                                        '--value-color': value.color,
                                    }}
                                >
                                    <div className="value-icon" style={{ background: `linear-gradient(135deg, ${value.color}20, ${value.color}10)` }}>
                                        <value.icon size={28} color={value.color} />
                                    </div>
                                    <h4>{value.title}</h4>
                                    <p className="value-description">{value.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className="stat-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
