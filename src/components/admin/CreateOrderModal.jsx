import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Minus, Trash2, Package, ShoppingBag, User, Phone, Mail, MapPin, AlertCircle, Tag } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useOrders } from '../../hooks/useOrders';
import toast from 'react-hot-toast';

export default function CreateOrderModal({ isOpen, onClose }) {
    const { items: inventoryItems, loading: inventoryLoading } = useInventory();
    const { createManualOrder } = useOrders();

    const [customer, setCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [orderItems, setOrderItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [discount, setDiscount] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Filtered inventory for search
    const filteredInventory = useMemo(() => {
        if (!searchTerm) return [];
        return inventoryItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5); // Limit search results
    }, [searchTerm, inventoryItems]);

    // Totals calculation
    const subtotal = useMemo(() => {
        return orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [orderItems]);

    const total = Math.max(0, subtotal - discount);

    const handleAddProduct = (product) => {
        const existing = orderItems.find(item => item.id === product.id);
        if (existing) {
            setOrderItems(orderItems.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setOrderItems([...orderItems, {
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                originalPrice: product.price,
                quantity: 1,
                stock: product.count
            }]);
        }
        setSearchTerm('');
        toast.success(`Added ${product.name}`);
    };

    const handleUpdateQuantity = (id, delta) => {
        setOrderItems(orderItems.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleUpdatePrice = (id, newPrice) => {
        setOrderItems(orderItems.map(item =>
            item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item
        ));
    };

    const handleRemoveItem = (id) => {
        setOrderItems(orderItems.filter(item => item.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (orderItems.length === 0) {
            toast.error('Add at least one product');
            return;
        }

        setSubmitting(true);
        try {
            const timestamp = Date.now().toString(36).toUpperCase();
            const orderId = `M-SAAJ-${timestamp}`;

            const orderData = {
                orderId,
                customer,
                items: orderItems,
                subtotal,
                discount: parseFloat(discount) || 0,
                total,
                type: 'manual',
                status: 'confirmed' // Manual orders are usually confirmed
            };

            await createManualOrder(orderData);
            onClose();
            resetForm();
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setCustomer({ name: '', email: '', phone: '', address: '' });
        setOrderItems([]);
        setDiscount(0);
        setSearchTerm('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ zIndex: 1100 }}
            >
                <motion.div
                    className="modal"
                    style={{ maxWidth: '800px', width: '95%' }}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <ShoppingBag className="text-primary" size={24} />
                            <h2>Create Manual Order</h2>
                        </div>
                        <button className="modal-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-content-form">
                        <div className="modal-body">
                            <div className="create-order-grid">
                                {/* Left Side: Search & Customer */}
                                <div className="order-setup-section">
                                    <div className="form-section">
                                        <h4><Plus size={18} /> Add Products</h4>
                                        <div className="product-search-container" style={{ position: 'relative' }}>
                                            <div className="search-wrapper">
                                                <Search size={18} className="search-icon" />
                                                <input
                                                    type="text"
                                                    className="form-input search-input"
                                                    placeholder="Search by name or category..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    style={{ paddingLeft: '2.5rem' }}
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {searchTerm && (
                                                    <motion.div
                                                        className="search-results"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                    >
                                                        {filteredInventory.length > 0 ? (
                                                            filteredInventory.map(product => (
                                                                <div
                                                                    key={product.id}
                                                                    className="search-result-item"
                                                                    onClick={() => handleAddProduct(product)}
                                                                >
                                                                    <div className="item-image">
                                                                        {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <Package size={16} />}
                                                                    </div>
                                                                    <div className="item-info">
                                                                        <span className="name">{product.name}</span>
                                                                        <div className="item-meta-row">
                                                                            <span className="price">₹{product.price}</span>
                                                                            <span className="dot">•</span>
                                                                            <span className="stock">Stock: {product.count}</span>
                                                                        </div>
                                                                    </div>
                                                                    <Plus size={16} className="add-icon" />
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="no-results">No products found</div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="form-section customer-form-section" style={{ marginTop: '2rem' }}>
                                        <h4><User size={18} /> Customer Details</h4>
                                        <div className="form-row customer-details-grid">
                                            <div className="form-group">
                                                <div className="label-with-icon">
                                                    <User size={14} />
                                                    <label className="form-label">Name *</label>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={customer.name}
                                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <div className="label-with-icon">
                                                    <Phone size={14} />
                                                    <label className="form-label">Phone *</label>
                                                </div>
                                                <input
                                                    type="tel"
                                                    className="form-input"
                                                    value={customer.phone}
                                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="label-with-icon">
                                                <Mail size={14} />
                                                <label className="form-label">Email</label>
                                            </div>
                                            <input
                                                type="email"
                                                className="form-input"
                                                value={customer.email}
                                                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <div className="label-with-icon">
                                                <MapPin size={14} />
                                                <label className="form-label">Address *</label>
                                            </div>
                                            <textarea
                                                className="form-textarea"
                                                value={customer.address}
                                                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                                required
                                                style={{ minHeight: '80px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Order Summary */}
                                <div className="order-summary-section">
                                    <h4>Order Items</h4>
                                    <div className="selected-items-list">
                                        {orderItems.length === 0 ? (
                                            <div className="empty-cart-msg">
                                                <ShoppingBag size={40} />
                                                <p>No items added yet</p>
                                            </div>
                                        ) : (
                                            orderItems.map(item => (
                                                <div key={item.id} className="selected-item">
                                                    <div className="selected-item-top">
                                                        <div className="item-main-info">
                                                            <div className="item-thumbnail">
                                                                {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <Package size={16} />}
                                                            </div>
                                                            <div className="item-text">
                                                                <span className="item-name">{item.name}</span>
                                                                {item.stock <= item.quantity && (
                                                                    <span className="stock-warning">
                                                                        <AlertCircle size={12} />
                                                                        Low Stock: {item.stock}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="remove-btn"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="item-controls-grid">
                                                        <div className="price-override-group">
                                                            <div className="price-input">
                                                                <span>₹</span>
                                                                <input
                                                                    type="number"
                                                                    value={item.price}
                                                                    onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                                                                    step="0.01"
                                                                />
                                                            </div>
                                                            {item.price !== item.originalPrice && (
                                                                <span className="original-price">
                                                                    Reg: ₹{item.originalPrice}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="qty-picker">
                                                            <button type="button" onClick={() => handleUpdateQuantity(item.id, -1)}><Minus size={14} /></button>
                                                            <span className="qty-value">{item.quantity}</span>
                                                            <button type="button" onClick={() => handleUpdateQuantity(item.id, 1)}><Plus size={14} /></button>
                                                        </div>
                                                        <div className="item-total-price">
                                                            ₹{(item.price * item.quantity).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="summary-footer">
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>₹{subtotal.toLocaleString()}</span>
                                        </div>

                                        <div className="discount-field-group">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="discount-label">
                                                    <Tag size={14} />
                                                    <span>Apply Discount (₹)</span>
                                                </div>
                                                {discount > 0 && (
                                                    <button
                                                        type="button"
                                                        className="clear-discount-btn"
                                                        onClick={() => setDiscount(0)}
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                            <div className="discount-input-wrapper">
                                                <span className="minus-prefix">-</span>
                                                <input
                                                    type="number"
                                                    value={discount || ''}
                                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    placeholder="Enter discount amount"
                                                />
                                            </div>
                                            {discount > 0 && (
                                                <div className="manual-savings-feedback">
                                                    Discount applied: ₹{discount.toLocaleString()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="gradient-divider"></div>

                                        <div className="total-row">
                                            <span className="total-label">Final Total</span>
                                            <motion.span
                                                key={total}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="total-amount"
                                            >
                                                ₹{total.toLocaleString()}
                                            </motion.span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || orderItems.length === 0}
                            >
                                {submitting ? 'Creating Order...' : 'Create Order'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
