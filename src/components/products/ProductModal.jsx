import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductModal({ product, isOpen, onClose }) {
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();

    if (!isOpen || !product) return null;

    const handleAddToCart = () => {
        addItem(product, quantity);
        toast.success(`${quantity} × ${product.name} added to cart!`);
        setQuantity(1);
        onClose();
    };

    const incrementQuantity = () => setQuantity((q) => q + 1);
    const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="product-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>

                    <div className="product-modal-content">
                        {/* Product Image */}
                        <div className="product-modal-image">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} />
                            ) : (
                                <div className="product-modal-placeholder">
                                    <Package size={80} strokeWidth={1} />
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="product-modal-details">
                            <span className="product-modal-category">{product.categoryName || 'Uncategorized'}</span>
                            <h2 className="product-modal-name">{product.name}</h2>

                            {/* Brand Display */}
                            {product.brandName && (
                                <div className="product-modal-brand" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '1rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '1px solid var(--gray-200)',
                                }}>
                                    {product.brandLogoUrl && (
                                        <img
                                            src={product.brandLogoUrl}
                                            alt={product.brandName}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                objectFit: 'contain',
                                                borderRadius: '4px',
                                            }}
                                        />
                                    )}
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--gray-600)',
                                        fontWeight: 500,
                                    }}>
                                        {product.brandName}
                                    </span>
                                </div>
                            )}

                            <p className="product-modal-price">
                                {product.price ? `₹${product.price.toLocaleString()}` : 'Price on request'}
                            </p>

                            {product.description && (
                                <p className="product-modal-description">{product.description}</p>
                            )}

                            {/* Stock Status */}
                            <div className="product-modal-stock">
                                {product.count > 0 ? (
                                    <span className="stock-available">
                                        ✓ In Stock ({product.count} available)
                                    </span>
                                ) : (
                                    <span className="stock-unavailable">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            <div className="product-modal-quantity">
                                <span>Quantity:</span>
                                <div className="quantity-controls">
                                    <button onClick={decrementQuantity} disabled={quantity <= 1}>
                                        <Minus size={18} />
                                    </button>
                                    <span>{quantity}</span>
                                    <button onClick={incrementQuantity}>
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <motion.button
                                className="btn btn-primary btn-lg product-modal-add"
                                onClick={handleAddToCart}
                                disabled={product.count === 0}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <ShoppingCart size={22} />
                                Add to Cart
                                {product.price > 0 && (
                                    <span className="add-total">₹{(product.price * quantity).toLocaleString()}</span>
                                )}
                            </motion.button>

                            {/* Contact for Bulk Orders */}
                            <p className="product-modal-bulk">
                                For bulk orders, <a href="#contact">contact us</a> for special pricing.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
