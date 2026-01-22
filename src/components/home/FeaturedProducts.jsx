import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Package, ShoppingCart } from 'lucide-react';
import { collection, query, where, limit, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useCart } from '../../context/CartContext';
import ProductModal from '../products/ProductModal';
import toast from 'react-hot-toast';

// Fallback demo products when no featured items exist
const demoProducts = [
    {
        id: 'demo1',
        name: 'EV SZ-888',
        categoryName: 'Electric Vehicles',
        imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&h=450&fit=crop',
        price: 4999,
    },
    {
        id: 'demo2',
        name: 'Zippy Quad',
        categoryName: 'Bikes',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop',
        price: 2999,
    },
    {
        id: 'demo3',
        name: 'Falcon Racer',
        categoryName: 'Cars',
        imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=450&fit=crop',
        price: 1499,
    },
    {
        id: 'demo4',
        name: 'EV Blue Thunder',
        categoryName: 'Electric Vehicles',
        imageUrl: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&h=450&fit=crop',
        price: 5999,
    },
    {
        id: 'demo5',
        name: 'Royal Rider',
        categoryName: 'Bikes',
        imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=450&fit=crop',
        price: 3499,
    },
    {
        id: 'demo6',
        name: 'KTM Mini',
        categoryName: 'Bikes',
        imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=450&fit=crop',
        price: 2499,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { addItem } = useCart();

    useEffect(() => {
        // If Firebase not configured, use demo products
        if (!db) {
            setProducts(demoProducts);
            setLoading(false);
            return;
        }

        // Fetch featured products from Firestore
        const q = query(
            collection(db, 'inventory'),
            where('featured', '==', true),
            orderBy('updatedAt', 'desc'),
            limit(8)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const featuredItems = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // If no featured products, show demo
            if (featuredItems.length === 0) {
                setProducts(demoProducts);
            } else {
                setProducts(featuredItems);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching featured products:', error);
            setProducts(demoProducts);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const handleAddToCart = (product, e) => {
        e.stopPropagation();
        addItem(product);
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <>
            <section id="products" className="section featured-products">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        <h2 className="section-title">
                            <span className="gradient-text">Featured</span> Products
                        </h2>
                        <p className="section-subtitle">
                            Handpicked selection of our most popular toys
                        </p>
                    </motion.div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                            <div className="loading-spinner" style={{ width: 48, height: 48 }} />
                        </div>
                    ) : (
                        <motion.div
                            className="products-grid"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    className="product-card"
                                    variants={itemVariants}
                                    whileHover={{ y: -8 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => setSelectedProduct(product)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="product-image">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'var(--gray-100)'
                                            }}>
                                                <Package size={48} strokeWidth={1} color="var(--gray-400)" />
                                            </div>
                                        )}
                                        <span className="product-category">
                                            {product.categoryName || 'Uncategorized'}
                                        </span>

                                        {/* Quick Add Button */}
                                        <motion.button
                                            className="product-quick-add"
                                            onClick={(e) => handleAddToCart(product, e)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ShoppingCart size={20} />
                                        </motion.button>
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.name}</h3>
                                        {product.brandName && (
                                            <p className="product-brand" style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--gray-500)',
                                                marginTop: '0.25rem',
                                            }}>
                                                {product.brandName}
                                            </p>
                                        )}
                                        <div className="product-meta">
                                            <span className="product-price">
                                                {product.price ? `₹${product.price.toLocaleString()}` : 'Price on request'}
                                            </span>
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Product Detail Modal */}
            <ProductModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </>
    );
}
