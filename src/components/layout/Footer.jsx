import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Home', path: '/' },
        { name: 'Featured Products', path: '/#products' },
        { name: 'About Us', path: '/#about' },
        { name: 'Contact', path: '/#contact' },
    ];

    const scrollToSection = (e, path) => {
        if (path.startsWith('/#')) {
            e.preventDefault();
            const sectionId = path.replace('/#', '');
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo">
                            <img src="/logo.png" alt="Saaj Trading" className="logo-img" />
                            <div className="logo-text">
                                <span className="logo-name">Saaj Trading</span>
                                <span className="logo-tagline">Wholesale Toy Distributor</span>
                            </div>
                        </div>
                        <p>
                            Wholesale distributor of toys — delivering quality, safety, and educational
                            value to retailers, e-commerce sellers, and distributors.
                        </p>
                        <div className="footer-socials">
                            <a href="https://www.instagram.com/saajtradingcompany" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-title">Quick Links</h4>
                        <div className="footer-links">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="footer-link"
                                    onClick={(e) => scrollToSection(e, link.path)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="footer-contact-section">
                        <h4 className="footer-title">Contact Info</h4>
                        <div className="footer-links footer-contact-links">
                            <div className="footer-link footer-contact-item">
                                <MapPin size={16} />
                                <span>Cheruvattoor M M Kavala, 13-384/8, Kothamangalam, Kerala 686691</span>
                            </div>
                            <a href="tel:+919847511422" className="footer-link footer-contact-item">
                                <Phone size={16} />
                                <span>098475 11422, 098475 11488, 0485 254 9422</span>
                            </a>
                            <a href="mailto:saajtradingcompany@gmail.com" className="footer-link footer-contact-item">
                                <Mail size={16} />
                                <span>saajtradingcompany@gmail.com</span>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-title">Business Hours</h4>
                        <div className="footer-links">
                            <span className="footer-link">Monday - Saturday</span>
                            <span className="footer-link">9:00 AM - 7:00 PM</span>
                            <span className="footer-link" style={{ marginTop: '0.5rem' }}>Sunday</span>
                            <span className="footer-link">10:00 AM - 5:00 PM</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {currentYear} Saaj Trading Company. All rights reserved.</p>
                    <Link
                        to="/login"
                        style={{
                            color: 'var(--gray-300)',
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                        }}
                    >
                        Admin
                    </Link>
                </div>
            </div>
        </footer>
    );
}
