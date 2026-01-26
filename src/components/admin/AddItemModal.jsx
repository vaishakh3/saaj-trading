import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { uploadImage, supabase } from '../../services/supabase';
import { compressImage } from '../../utils/imageCompression';
import toast from 'react-hot-toast';

export default function AddItemModal({ isOpen, onClose, editingItem, categories, brands = [] }) {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [count, setCount] = useState(0);
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [featured, setFeatured] = useState(false);
    const [brandId, setBrandId] = useState('');
    const [customBrand, setCustomBrand] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [compressionStats, setCompressionStats] = useState(null);
    const fileInputRef = useRef(null);
    const { addItem, updateItem } = useInventory();

    useEffect(() => {
        if (editingItem) {
            setName(editingItem.name || '');
            setCategoryId(editingItem.categoryId || '');
            setCount(editingItem.count || 0);
            setPrice(editingItem.price || '');
            setDescription(editingItem.description || '');
            setFeatured(editingItem.featured || false);
            setBrandId(editingItem.brandId || '');
            setCustomBrand(editingItem.customBrand || '');
            setImagePreview(editingItem.imageUrl || '');
        } else {
            resetForm();
        }
    }, [editingItem, isOpen]);

    const resetForm = () => {
        setName('');
        setCategoryId('');
        setCount(0);
        setPrice('');
        setDescription('');
        setFeatured(false);
        setBrandId('');
        setCustomBrand('');
        setImageFile(null);
        setImagePreview('');
        setUploadProgress('');
        setCompressionStats(null);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 10MB before compression)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Compress in background
        setUploadProgress('Compressing...');
        const originalSize = file.size;

        try {
            const compressedFile = await compressImage(file, (progress) => {
                setUploadProgress(`Compressing... ${progress}%`);
            });

            setImageFile(compressedFile);

            // Show compression stats
            const saved = originalSize - compressedFile.size;
            const percentage = ((saved / originalSize) * 100).toFixed(0);
            if (saved > 0) {
                setCompressionStats({
                    original: formatBytes(originalSize),
                    compressed: formatBytes(compressedFile.size),
                    saved: percentage,
                });
            }

            // Update preview with compressed version
            const compressedReader = new FileReader();
            compressedReader.onloadend = () => {
                setImagePreview(compressedReader.result);
            };
            compressedReader.readAsDataURL(compressedFile);

            setUploadProgress('');
        } catch (error) {
            console.error('Compression error:', error);
            setImageFile(file); // Use original if compression fails
            setUploadProgress('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            let imageUrl = editingItem?.imageUrl || '';

            // Upload new image if selected
            if (imageFile) {
                if (!supabase) {
                    toast.error('Image upload not configured. Add Supabase credentials to .env');
                    setLoading(false);
                    return;
                }

                setUploadProgress('Uploading...');
                imageUrl = await uploadImage(imageFile);
                setUploadProgress('');
            }

            const selectedCategory = categories.find((c) => c.id === categoryId);
            const selectedBrand = brands.find((b) => b.id === brandId);

            // Determine brand info
            let brandName = '';
            let brandLogoUrl = '';
            if (brandId === 'others') {
                brandName = customBrand.trim();
            } else if (selectedBrand) {
                brandName = selectedBrand.name;
                brandLogoUrl = selectedBrand.logoUrl || '';
            }

            const itemData = {
                name: name.trim(),
                categoryId: categoryId || null,
                categoryName: selectedCategory?.name || 'Uncategorized',
                count: parseInt(count) || 0,
                price: parseFloat(price) || 0,
                description: description.trim(),
                featured,
                brandId: brandId || null,
                brandName,
                brandLogoUrl,
                customBrand: brandId === 'others' ? customBrand.trim() : '',
                imageUrl,
            };

            if (editingItem) {
                await updateItem(editingItem.id, itemData);
            } else {
                await addItem(itemData);
            }

            onClose();
            resetForm();
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error('Failed to save item');
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
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
            >
                <motion.div
                    className="modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>{editingItem ? 'Edit Product' : 'Add New Product'}</h2>
                        <button className="modal-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-content-form">
                        <div className="modal-body">
                            {/* Image Upload */}
                            <div className="form-group">
                                <label className="form-label">Product Image</label>
                                <div
                                    className={`image-upload ${imagePreview ? 'has-image' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" />
                                    ) : (
                                        <div className="image-upload-content">
                                            <Upload size={32} />
                                            <p>Click to upload image</p>
                                            <span style={{ fontSize: '0.875rem' }}>PNG, JPG up to 10MB</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />

                                {/* Compression stats */}
                                {compressionStats && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--success-light, #dcfce7)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.75rem',
                                        color: 'var(--success, #16a34a)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <CheckCircle size={14} />
                                        <span>
                                            Compressed: {compressionStats.original} → {compressionStats.compressed}
                                            ({compressionStats.saved}% smaller)
                                        </span>
                                    </div>
                                )}

                                {uploadProgress && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem' }}>
                                        {uploadProgress}
                                    </p>
                                )}

                                {!supabase && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.5rem' }}>
                                        ⚠️ Image upload requires Supabase configuration in .env
                                    </p>
                                )}
                            </div>

                            {/* Name */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="itemName">Product Name *</label>
                                <input
                                    id="itemName"
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter product name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="itemCategory">Category</label>
                                <select
                                    id="itemCategory"
                                    className="form-input"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Brand */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="itemBrand">Brand</label>
                                <select
                                    id="itemBrand"
                                    className="form-input"
                                    value={brandId}
                                    onChange={(e) => {
                                        setBrandId(e.target.value);
                                        if (e.target.value !== 'others') {
                                            setCustomBrand('');
                                        }
                                    }}
                                >
                                    <option value="">No brand</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                    <option value="others">Others (custom)</option>
                                </select>
                            </div>

                            {/* Custom Brand Input */}
                            {brandId === 'others' && (
                                <div className="form-group">
                                    <label className="form-label" htmlFor="customBrand">Custom Brand Name</label>
                                    <input
                                        id="customBrand"
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter brand name"
                                        value={customBrand}
                                        onChange={(e) => setCustomBrand(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Count */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="itemCount">Initial Stock Count</label>
                                <input
                                    id="itemCount"
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={count}
                                    onChange={(e) => setCount(e.target.value)}
                                    min="0"
                                />
                            </div>

                            {/* Price */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="itemPrice">Price (₹)</label>
                                <input
                                    id="itemPrice"
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="itemDescription">Description</label>
                                <textarea
                                    id="itemDescription"
                                    className="form-textarea"
                                    placeholder="Brief product description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{ minHeight: '80px' }}
                                />
                            </div>

                            {/* Featured */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={featured}
                                        onChange={(e) => setFeatured(e.target.checked)}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span className="form-label" style={{ margin: 0 }}>
                                        Show in Featured Products
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <motion.button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !name.trim()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <>
                                        <div className="loading-spinner" style={{ width: 18, height: 18 }} />
                                        {uploadProgress || 'Saving...'}
                                    </>
                                ) : (
                                    editingItem ? 'Update Product' : 'Add Product'
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
