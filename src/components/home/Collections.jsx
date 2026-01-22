import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Fallback collections when no categories exist
const demoCollections = [
    {
        id: 'demo1',
        name: 'Electric Vehicles',
        image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&h=400&fit=crop',
    },
    {
        id: 'demo2',
        name: 'Bikes & Scooters',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    },
    {
        id: 'demo3',
        name: 'Cars & Racing',
        image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop',
    },
    {
        id: 'demo4',
        name: 'Educational Toys',
        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
};

export default function Collections() {
    const [categories, setCategories] = useState([]);
    const [productCounts, setProductCounts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setCategories(demoCollections);
            setLoading(false);
            return;
        }

        // Fetch categories
        const q = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const categoryList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // If no categories, use demo
            if (categoryList.length === 0) {
                setCategories(demoCollections);
            } else {
                setCategories(categoryList);

                // Fetch product counts for each category
                const counts = {};
                for (const cat of categoryList) {
                    try {
                        const productsQuery = query(
                            collection(db, 'inventory'),
                            where('categoryId', '==', cat.id)
                        );
                        const productsSnap = await getDocs(productsQuery);
                        counts[cat.id] = productsSnap.size;
                    } catch (e) {
                        counts[cat.id] = 0;
                    }
                }
                setProductCounts(counts);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <section className="section collections">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="section-title">
                        Our <span className="gradient-text">Collection</span>
                    </h2>
                    <p className="section-subtitle">
                        Explore our comprehensive range of premium toys, carefully organized by category.
                    </p>
                </motion.div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div className="loading-spinner" />
                    </div>
                ) : (
                    <motion.div
                        className="collections-grid"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {categories.map((category) => (
                            <motion.div
                                key={category.id}
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Link
                                    to={`/products?category=${category.id}`}
                                    className="collection-card"
                                >
                                    {category.imageUrl || category.image ? (
                                        <img
                                            src={category.imageUrl || category.image}
                                            alt={category.name}
                                        />
                                    ) : (
                                        <div className="collection-placeholder">
                                            <Package size={48} strokeWidth={1} />
                                        </div>
                                    )}
                                    <div className="collection-info">
                                        <h3 className="collection-name">{category.name}</h3>
                                        <span className="collection-count">
                                            {productCounts[category.id] !== undefined
                                                ? `${productCounts[category.id]} Products`
                                                : category.count || 'View Products'
                                            }
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}
