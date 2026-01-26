import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Download,
    Trash2,
    Package,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    ChevronDown,
    Eye,
    Plus
} from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import ConfirmModal from '../common/ConfirmModal';
import CreateOrderModal from './CreateOrderModal';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: '#F59E0B', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: '#3B82F6', icon: CheckCircle },
    { value: 'shipped', label: 'Shipped', color: '#8B5CF6', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: '#10B981', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: '#EF4444', icon: XCircle },
];

export default function OrdersTab() {
    const { orders, loading, updateOrderStatus, deleteOrder } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filter orders
    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Address', 'Items', 'Total', 'Status'];
        const rows = filteredOrders.map(order => [
            order.orderId,
            order.createdAt?.toLocaleDateString?.() || '',
            order.customer?.name || '',
            order.customer?.email || '',
            order.customer?.phone || '',
            `"${order.customer?.address?.replace(/"/g, '""') || ''}"`,
            `"${order.items?.map(i => `${i.name} x${i.quantity}`).join(', ') || ''}"`,
            order.total || 0,
            order.status || 'pending',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleDeleteClick = (order) => {
        setConfirmDelete(order);
    };

    const confirmDeleteOrder = async () => {
        if (confirmDelete) {
            await deleteOrder(confirmDelete.id);
            setConfirmDelete(null);
        }
    };

    const getStatusInfo = (status) => {
        return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    if (loading) {
        return (
            <div className="loading-overlay" style={{ position: 'relative', minHeight: '300px' }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="orders-header">
                <div className="orders-search">
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--gray-400)'
                            }}
                        />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by order ID or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '2.75rem', width: '100%' }}
                        />
                    </div>
                    <select
                        className="form-input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '150px' }}
                    >
                        <option value="all">All Status</option>
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={exportToCSV}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={filteredOrders.length === 0}
                    >
                        <Download size={18} />
                        Export CSV
                    </motion.button>

                    <motion.button
                        className="btn btn-primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus size={18} />
                        Create Manual Order
                    </motion.button>
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="empty-state">
                    <Package size={80} />
                    <h3>No orders found</h3>
                    <p>
                        {searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter'
                            : 'Orders will appear here when customers place them'}
                    </p>
                </div>
            ) : (
                <div className="orders-list">
                    <AnimatePresence>
                        {filteredOrders.map((order) => {
                            const statusInfo = getStatusInfo(order.status);
                            const StatusIcon = statusInfo.icon;
                            const isExpanded = expandedOrder === order.id;

                            return (
                                <motion.div
                                    key={order.id}
                                    className="order-card"
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {/* Order Header */}
                                    <div className="order-card-header">
                                        <div className="order-info">
                                            <div className="order-id">
                                                <strong>{order.orderId}</strong>
                                                <span
                                                    className="order-status-badge"
                                                    style={{
                                                        background: `${statusInfo.color}20`,
                                                        color: statusInfo.color
                                                    }}
                                                >
                                                    <StatusIcon size={14} />
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="order-meta">
                                                <span>{formatDate(order.createdAt)}</span>
                                                <span>•</span>
                                                <span>{order.customer?.name}</span>
                                                <span>•</span>
                                                <span className="order-total">₹{order.total?.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="order-actions">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                title="View details"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <select
                                                className="form-input order-status-select"
                                                value={order.status || 'pending'}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                style={{
                                                    width: '130px',
                                                    fontSize: '0.875rem',
                                                    padding: '0.5rem',
                                                }}
                                            >
                                                {STATUS_OPTIONS.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleDeleteClick(order)}
                                                style={{ color: 'var(--error)' }}
                                                title="Delete order"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                className="order-details"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div className="order-details-grid">
                                                    <div className="order-detail-section">
                                                        <h4>Customer Details</h4>
                                                        <p><strong>Name:</strong> {order.customer?.name}</p>
                                                        <p><strong>Email:</strong> {order.customer?.email}</p>
                                                        <p><strong>Phone:</strong> {order.customer?.phone}</p>
                                                        <p><strong>Address:</strong> {order.customer?.address}</p>
                                                    </div>

                                                    <div className="order-detail-section">
                                                        <h4>Order Items</h4>
                                                        <div className="order-items-list">
                                                            {order.items?.map((item, idx) => (
                                                                <div key={idx} className="order-item">
                                                                    <div className="order-item-image">
                                                                        {item.imageUrl ? (
                                                                            <img src={item.imageUrl} alt={item.name} />
                                                                        ) : (
                                                                            <Package size={20} />
                                                                        )}
                                                                    </div>
                                                                    <div className="order-item-info">
                                                                        <span>{item.name}</span>
                                                                        <span className="order-item-qty">×{item.quantity}</span>
                                                                    </div>
                                                                    <span className="order-item-price">
                                                                        ₹{((item.price || 0) * item.quantity).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="order-summary">
                                                            <div className="order-summary-row">
                                                                <span>Subtotal</span>
                                                                <span>₹{order.subtotal?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="order-summary-row total">
                                                                <span>Total</span>
                                                                <span>₹{order.total?.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )
            }

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!confirmDelete}
                onConfirm={confirmDeleteOrder}
                onCancel={() => setConfirmDelete(null)}
                title="Delete order?"
                message={confirmDelete ? `Are you sure you want to delete order "${confirmDelete.orderId}"? This action cannot be undone.` : ''}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* Create Order Modal */}
            <CreateOrderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
}
