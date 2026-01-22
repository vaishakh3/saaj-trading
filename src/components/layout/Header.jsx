import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Settings, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { itemCount, openCart } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'About', path: '/#about' },
    ];

    const scrollToSection = (e, path) => {
        if (path.startsWith('/#')) {
            e.preventDefault();
            const sectionId = path.replace('/#', '');

            // If not on home page, navigate there first
            if (location.pathname !== '/') {
                navigate('/');
                // Wait for navigation, then scroll
                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            } else {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <>
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <div className="header-content">
                        <Link to="/" className="logo">
                            <div className="logo-icon">ST</div>
                            <div className="logo-text">
                                <span className="logo-name">Saaj Trading</span>
                                <span className="logo-tagline">Wholesale Toy Distributor</span>
                            </div>
                        </Link>

                        <nav className="nav-links">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="nav-link"
                                    onClick={(e) => scrollToSection(e, link.path)}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* Cart Button */}
                            <button className="cart-btn" onClick={openCart} aria-label="Open cart">
                                <ShoppingCart size={22} />
                                {itemCount > 0 && (
                                    <span className="cart-badge">{itemCount}</span>
                                )}
                            </button>

                            <Link to="/#contact" className="nav-cta" onClick={(e) => scrollToSection(e, '/#contact')}>
                                Get in Touch
                            </Link>
                            {isAuthenticated && (
                                <Link to="/admin" className="nav-link" title="Admin Dashboard">
                                    <Settings size={20} />
                                </Link>
                            )}
                        </nav>

                        <div className="header-mobile-actions">
                            {/* Mobile Cart Button */}
                            <button className="cart-btn" onClick={openCart} aria-label="Open cart">
                                <ShoppingCart size={22} />
                                {itemCount > 0 && (
                                    <span className="cart-badge">{itemCount}</span>
                                )}
                            </button>

                            <button
                                className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu - Always mounted, animated with CSS */}
            <div
                className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />
            <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-links">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="mobile-nav-link"
                            onClick={(e) => scrollToSection(e, link.path)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {isAuthenticated && (
                        <Link to="/admin" className="mobile-nav-link">
                            Admin Dashboard
                        </Link>
                    )}
                    <Link
                        to="/#contact"
                        className="btn btn-primary"
                        onClick={(e) => scrollToSection(e, '/#contact')}
                        style={{ marginTop: '1rem', textAlign: 'center' }}
                    >
                        Get in Touch
                    </Link>
                </div>
            </nav>
        </>
    );
}
