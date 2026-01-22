import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ShoppingCart, Package, ArrowUpDown } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import { useCart } from '../context/CartContext';
import ProductModal from '../components/products/ProductModal';
import toast from 'react-hot-toast';

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [brandFilter, setBrandFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const { categories } = useCategories();
    const { brands } = useBrands();
    const { addItem } = useCart();

    const categoryFilter = searchParams.get('category') || '';

    // Fetch products from Firestore
    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'inventory'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching products:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Filter and sort products
    const filteredProducts = products
        .filter((product) => {
            const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
            const matchesBrand = !brandFilter || product.brandId === brandFilter ||
                (brandFilter === 'no-brand' && !product.brandId);
            return matchesSearch && matchesCategory && matchesBrand;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return (a.price || 0) - (b.price || 0);
                case 'price-high':
                    return (b.price || 0) - (a.price || 0);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'newest':
                default:
                    return 0; // Keep original order (newest first from Firestore)
            }
        });

    const handleCategoryChange = (categoryId) => {
        if (categoryId) {
            setSearchParams({ category: categoryId });
        } else {
            setSearchParams({});
        }
    };

    const handleAddToCart = (product, e) => {
        e.stopPropagation();
        addItem(product);
        toast.success(`${product.name} added to cart!`);
    };

    const selectedCategoryName = categories.find(c => c.id === categoryFilter)?.name;

    return (
        <div className="products-page">
            <div className="container">
                {/* Page Header */}
                <motion.div
                    className="products-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1>
                        {selectedCategoryName ? (
                            <>
                                <span className="gradient-text">{selectedCategoryName}</span>
                            </>
                        ) : (
                            <>
                                Our <span className="gradient-text">Products</span>
                            </>
                        )}
                    </h1>
                    <p className="products-subtitle">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
                    </p>
                </motion.div>

                {/* Filters Bar */}
                <motion.div
                    className="products-filters"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Search */}
                    <div className="search-wrapper">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="search-clear"
                                onClick={() => setSearchQuery('')}
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div className="category-filter">
                        <Filter size={18} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="category-select"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Brand Filter */}
                    <div className="category-filter">
                        <select
                            value={brandFilter}
                            onChange={(e) => setBrandFilter(e.target.value)}
                            className="category-select"
                        >
                            <option value="">All Brands</option>
                            <option value="no-brand">No Brand</option>
                            {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div className="category-filter">
                        <ArrowUpDown size={18} />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="category-select"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>

                    {/* Active Filters */}
                    {(categoryFilter || brandFilter || searchQuery) && (
                        <button
                            className="clear-filters"
                            onClick={() => {
                                setSearchQuery('');
                                setBrandFilter('');
                                setSortBy('newest');
                                setSearchParams({});
                            }}
                        >
                            Clear All
                            <X size={16} />
                        </button>
                    )}
                </motion.div>

                {/* Products Grid */}
                {loading ? (
                    <div className="products-loading">
                        <div className="loading-spinner" />
                        <p>Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <motion.div
                        className="products-empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Package size={64} strokeWidth={1} />
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setSearchQuery('');
                                setSearchParams({});
                            }}
                        >
                            View All Products
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="products-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    className="product-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -8 }}
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    <div className="product-image">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} />
                                        ) : (
                                            <div className="product-image-placeholder">
                                                <Package size={48} strokeWidth={1} />
                                            </div>
                                        )}
                                        <span className="product-category">{product.categoryName || 'Uncategorized'}</span>

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
                                            {product.count > 0 && (
                                                <span className="product-stock">In Stock</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Product Detail Modal */}
            <ProductModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}
