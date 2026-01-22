import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Tags,
    Building2,
    LogOut,
    Plus,
    Search,
    Home,
    AlertTriangle,
    TrendingUp,
    Box,
    Minus,
    Menu,
    X,
    ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../hooks/useInventory';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import { useOrders } from '../hooks/useOrders';
import AddItemModal from '../components/admin/AddItemModal';
import CategoryModal from '../components/admin/CategoryModal';
import BrandModal from '../components/admin/BrandModal';
import OrdersTab from '../components/admin/OrdersTab';
import ConfirmModal from '../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { user, logout, isAuthenticated } = useAuth();
    const { items, loading: inventoryLoading, updateCount, deleteItem, setStock } = useInventory();
    const { categories, loading: categoriesLoading } = useCategories();
    const { brands, loading: brandsLoading } = useBrands();
    const { orders } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [stockValue, setStockValue] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [activeTab, setActiveTab] = useState('inventory');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleDeleteClick = (item) => {
        setConfirmDelete(item);
    };

    const confirmDeleteItem = async () => {
        if (confirmDelete) {
            try {
                await deleteItem(confirmDelete.id, confirmDelete.imageUrl);
            } catch (error) {
                console.error('Delete error:', error);
            }
            setConfirmDelete(null);
        }
    };

    const handleCountChange = async (itemId, change) => {
        try {
            await updateCount(itemId, change);
        } catch (error) {
            console.error('Count update error:', error);
        }
    };

    const filteredItems = items
        .filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
            const matchesBrand = selectedBrand === 'all' || item.brandId === selectedBrand ||
                (selectedBrand === 'no-brand' && !item.brandId);
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
                case 'stock-low':
                    return (a.count || 0) - (b.count || 0);
                case 'stock-high':
                    return (b.count || 0) - (a.count || 0);
                case 'newest':
                default:
                    return 0;
            }
        });

    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + (item.count || 0), 0);
    const lowStockItems = items.filter((item) => item.count <= 5).length;
    const totalCategories = categories.length;

    const stats = [
        { label: 'Total Products', value: totalItems, icon: Box, color: '#6366F1' },
        { label: 'Total Stock', value: totalStock, icon: TrendingUp, color: '#10B981' },
        { label: 'Low Stock', value: lowStockItems, icon: AlertTriangle, color: '#F59E0B' },
        { label: 'Categories', value: totalCategories, icon: Tags, color: '#EC4899' },
        { label: 'Brands', value: brands.length, icon: Building2, color: '#8B5CF6' },
    ];

    return (
        <div className="admin-layout">
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Mobile Menu Toggle */}
            <button
                className="admin-menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-logo">
                    <div className="logo-icon" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>ST</div>
                    <div className="logo-text">
                        <span className="logo-name">Saaj Trading</span>
                    </div>
                </div>

                <nav className="admin-nav">
                    <button
                        className={`admin-nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('inventory');
                            setSidebarOpen(false);
                        }}
                        style={{ width: '100%', textAlign: 'left' }}
                    >
                        <Package size={20} />
                        Inventory
                    </button>
                    <button
                        className={`admin-nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('orders');
                            setSidebarOpen(false);
                        }}
                        style={{ width: '100%', textAlign: 'left' }}
                    >
                        <ShoppingBag size={20} />
                        Orders
                        {orders.length > 0 && (
                            <span style={{
                                marginLeft: 'auto',
                                background: 'var(--primary)',
                                color: 'white',
                                borderRadius: '10px',
                                padding: '2px 8px',
                                fontSize: '0.75rem',
                            }}>
                                {orders.length}
                            </span>
                        )}
                    </button>
                    <button
                        className="admin-nav-link"
                        onClick={() => {
                            setIsCategoryModalOpen(true);
                            setSidebarOpen(false);
                        }}
                        style={{ width: '100%', textAlign: 'left' }}
                    >
                        <Tags size={20} />
                        Categories
                    </button>
                    <button
                        className="admin-nav-link"
                        onClick={() => {
                            setIsBrandModalOpen(true);
                            setSidebarOpen(false);
                        }}
                        style={{ width: '100%', textAlign: 'left' }}
                    >
                        <Building2 size={20} />
                        Brands
                    </button>
                    <Link to="/" className="admin-nav-link">
                        <Home size={20} />
                        View Website
                    </Link>
                </nav>

                <button
                    className="admin-nav-link"
                    onClick={handleLogout}
                    style={{ marginTop: 'auto' }}
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <h1 className="admin-title">{activeTab === 'orders' ? 'Order Management' : 'Inventory Management'}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                            {user?.email}
                        </span>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={handleLogout}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <LogOut size={18} />
                            <span className="sr-only">Logout</span>
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Stats */}
                    <div className="admin-stats">
                        {stats.map((stat) => (
                            <motion.div
                                key={stat.label}
                                className="admin-stat-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h3>{stat.label}</h3>
                                    <stat.icon size={20} color={stat.color} />
                                </div>
                                <div className="value">{stat.value}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Conditional Content based on Active Tab */}
                    {activeTab === 'orders' ? (
                        <OrdersTab />
                    ) : (
                        <>
                            {/* Inventory Header */}
                            <div className="inventory-header">
                                <div className="inventory-search">
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
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ paddingLeft: '2.75rem', width: '100%' }}
                                        />
                                    </div>
                                    <select
                                        className="form-input"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        style={{ width: '160px' }}
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="form-input"
                                        value={selectedBrand}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        style={{ width: '140px' }}
                                    >
                                        <option value="all">All Brands</option>
                                        <option value="no-brand">No Brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="form-input"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{ width: '150px' }}
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="price-low">Price: Low → High</option>
                                        <option value="price-high">Price: High → Low</option>
                                        <option value="stock-low">Stock: Low → High</option>
                                        <option value="stock-high">Stock: High → Low</option>
                                        <option value="name">Name: A → Z</option>
                                    </select>
                                </div>

                                <motion.button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setEditingItem(null);
                                        setIsAddModalOpen(true);
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Plus size={20} />
                                    Add Product
                                </motion.button>
                            </div>

                            {/* Inventory Grid */}
                            {inventoryLoading || categoriesLoading ? (
                                <div className="loading-overlay" style={{ position: 'relative', minHeight: '300px' }}>
                                    <div className="loading-spinner" />
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="empty-state">
                                    <Package size={80} />
                                    <h3>No products found</h3>
                                    <p>
                                        {searchQuery || selectedCategory !== 'all'
                                            ? 'Try adjusting your search or filter'
                                            : 'Get started by adding your first product'}
                                    </p>
                                    {!searchQuery && selectedCategory === 'all' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setIsAddModalOpen(true)}
                                        >
                                            <Plus size={20} />
                                            Add First Product
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <motion.div
                                    className="inventory-grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <AnimatePresence>
                                        {filteredItems.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                className="inventory-card"
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                            >
                                                <div className="inventory-image">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'var(--gray-100)'
                                                        }}>
                                                            <Package size={48} color="var(--gray-300)" />
                                                        </div>
                                                    )}
                                                    <span className="inventory-badge">{item.categoryName || 'Uncategorized'}</span>
                                                </div>

                                                <div className="inventory-content">
                                                    <h3 className="inventory-name">{item.name}</h3>
                                                    <p className="inventory-category">{item.categoryName || 'Uncategorized'}</p>

                                                    <div className="inventory-stock">
                                                        <span className="stock-label">Stock:</span>
                                                        <span
                                                            className="stock-value"
                                                            style={{
                                                                color: item.count <= 5 ? 'var(--warning)' : item.count <= 0 ? 'var(--error)' : 'var(--gray-900)',
                                                                fontWeight: 700,
                                                                fontSize: '1.125rem',
                                                            }}
                                                        >
                                                            {item.count || 0}
                                                        </span>
                                                    </div>

                                                    <div className="inventory-actions">
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => {
                                                                setEditingItem(item);
                                                                setIsAddModalOpen(true);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => handleDeleteClick(item)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Modals */}
            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                }}
                editingItem={editingItem}
                categories={categories}
                brands={brands}
            />

            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
            />

            <BrandModal
                isOpen={isBrandModalOpen}
                onClose={() => setIsBrandModalOpen(false)}
            />

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!confirmDelete}
                onConfirm={confirmDeleteItem}
                onCancel={() => setConfirmDelete(null)}
                title="Delete product?"
                message={confirmDelete ? `Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.` : ''}
                confirmText="Remove"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}
