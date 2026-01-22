import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../common/ConfirmModal';

export default function CartDrawer() {
    const { items, itemCount, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart();
    const navigate = useNavigate();
    const [confirmRemove, setConfirmRemove] = useState(null);

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    const handleQuantityDecrease = (item) => {
        if (item.quantity === 1) {
            // Show confirmation when trying to remove last item
            setConfirmRemove(item);
        } else {
            updateQuantity(item.id, item.quantity - 1);
        }
    };

    const handleRemoveClick = (item) => {
        setConfirmRemove(item);
    };

    const confirmRemoveItem = () => {
        if (confirmRemove) {
            removeItem(confirmRemove.id);
            setConfirmRemove(null);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="cart-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeCart}
                        />

                        {/* Drawer */}
                        <motion.div
                            className="cart-drawer"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <div className="cart-header">
                                <h2>
                                    <ShoppingBag size={24} />
                                    Your Cart ({itemCount})
                                </h2>
                                <button className="cart-close" onClick={closeCart}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="cart-body">
                                {items.length === 0 ? (
                                    <div className="cart-empty">
                                        <ShoppingBag size={64} strokeWidth={1} />
                                        <p>Your cart is empty</p>
                                        <button className="btn btn-primary" onClick={closeCart}>
                                            Continue Shopping
                                        </button>
                                    </div>
                                ) : (
                                    <div className="cart-items">
                                        <AnimatePresence>
                                            {items.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    className="cart-item"
                                                    layout
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                >
                                                    <div className="cart-item-image">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.name} />
                                                        ) : (
                                                            <div className="cart-item-placeholder">
                                                                <ShoppingBag size={24} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="cart-item-details">
                                                        <h4>{item.name}</h4>
                                                        <p className="cart-item-category">{item.categoryName}</p>
                                                        <p className="cart-item-price">₹{item.price?.toLocaleString() || 'Price TBD'}</p>
                                                    </div>

                                                    <div className="cart-item-actions">
                                                        <div className="quantity-controls">
                                                            <button
                                                                onClick={() => handleQuantityDecrease(item)}
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <span>{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                        <button
                                                            className="cart-item-remove"
                                                            onClick={() => handleRemoveClick(item)}
                                                            aria-label="Remove item"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {items.length > 0 && (
                                <div className="cart-footer">
                                    <div className="cart-subtotal">
                                        <span>Subtotal</span>
                                        <span className="cart-subtotal-value">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <p className="cart-shipping-note">Shipping calculated at checkout</p>
                                    <motion.button
                                        className="btn btn-primary btn-lg"
                                        style={{ width: '100%' }}
                                        onClick={handleCheckout}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Proceed to Checkout
                                        <ArrowRight size={20} />
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Confirm Remove Modal */}
            <ConfirmModal
                isOpen={!!confirmRemove}
                onConfirm={confirmRemoveItem}
                onCancel={() => setConfirmRemove(null)}
                title="Remove item?"
                message={confirmRemove ? `Are you sure you want to remove "${confirmRemove.name}" from your cart?` : ''}
                confirmText="Remove"
                cancelText="Cancel"
                type="danger"
            />
        </>
    );
}
