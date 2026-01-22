import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Building2, Upload } from 'lucide-react';
import { useBrands } from '../../hooks/useBrands';
import { uploadImage, supabase } from '../../services/supabase';
import { compressImage } from '../../utils/imageCompression';
import ConfirmModal from '../common/ConfirmModal';
import toast from 'react-hot-toast';

export default function BrandModal({ isOpen, onClose }) {
    const { brands, loading, addBrand, updateBrand, deleteBrand } = useBrands();
    const [newBrandName, setNewBrandName] = useState('');
    const [editingBrand, setEditingBrand] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);

        // Compress
        setUploadProgress('Compressing...');
        try {
            const compressed = await compressImage(file);
            setImageFile(compressed);
            setUploadProgress('');
        } catch (err) {
            setImageFile(file);
            setUploadProgress('');
        }
    };

    const handleAdd = async () => {
        if (!newBrandName.trim()) return;

        setIsAdding(true);
        try {
            let logoUrl = '';

            if (imageFile && supabase) {
                setUploadProgress('Uploading logo...');
                logoUrl = await uploadImage(imageFile, 'brands');
                setUploadProgress('');
            }

            await addBrand({
                name: newBrandName.trim(),
                logoUrl,
            });

            // Reset form
            setNewBrandName('');
            setImageFile(null);
            setImagePreview('');
        } catch (error) {
            console.error('Error adding brand:', error);
        } finally {
            setIsAdding(false);
            setUploadProgress('');
        }
    };

    const handleUpdate = async () => {
        if (!editingBrand || !editingBrand.name.trim()) return;

        try {
            await updateBrand(editingBrand.id, {
                name: editingBrand.name,
                logoUrl: editingBrand.logoUrl,
            });
            setEditingBrand(null);
        } catch (error) {
            console.error('Error updating brand:', error);
        }
    };

    const handleDeleteClick = (brand) => {
        setConfirmDelete(brand);
    };

    const confirmDeleteBrand = async () => {
        if (confirmDelete) {
            try {
                await deleteBrand(confirmDelete.id, confirmDelete.logoUrl);
            } catch (error) {
                console.error('Error deleting brand:', error);
            }
            setConfirmDelete(null);
        }
    };

    return (
        <>
            {isOpen && (
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
                            style={{ maxWidth: '500px' }}
                        >
                            <div className="modal-header">
                                <h2>Manage Brands</h2>
                                <button className="modal-close" onClick={onClose}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body">
                                {/* Add New Brand */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">Add New Brand</label>

                                    {/* Logo Upload */}
                                    <div
                                        className="brand-logo-upload"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            width: '100%',
                                            height: '100px',
                                            border: '2px dashed var(--gray-300)',
                                            borderRadius: 'var(--radius-lg)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            marginBottom: '0.75rem',
                                            overflow: 'hidden',
                                            background: imagePreview ? 'white' : 'var(--gray-50)',
                                        }}
                                    >
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
                                                <Upload size={24} />
                                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                                    Click to add brand logo
                                                </p>
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

                                    {uploadProgress && (
                                        <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                            {uploadProgress}
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Brand name (e.g., Style Zone)"
                                            value={newBrandName}
                                            onChange={(e) => setNewBrandName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                                            style={{ flex: 1 }}
                                        />
                                        <motion.button
                                            className="btn btn-primary btn-icon"
                                            onClick={handleAdd}
                                            disabled={isAdding || !newBrandName.trim()}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Plus size={20} />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Brands List */}
                                <div>
                                    <label className="form-label">Existing Brands</label>
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                                        </div>
                                    ) : brands.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '2rem',
                                            background: 'var(--gray-50)',
                                            borderRadius: 'var(--radius-lg)'
                                        }}>
                                            <Building2 size={32} color="var(--gray-300)" />
                                            <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>No brands yet</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                                            <AnimatePresence>
                                                {brands.map((brand) => (
                                                    <motion.div
                                                        key={brand.id}
                                                        layout
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            padding: '0.75rem',
                                                            background: 'var(--gray-50)',
                                                            borderRadius: 'var(--radius-md)',
                                                        }}
                                                    >
                                                        {/* Brand Logo Thumbnail */}
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: 'var(--radius-md)',
                                                            overflow: 'hidden',
                                                            flexShrink: 0,
                                                            background: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: '1px solid var(--gray-200)',
                                                        }}>
                                                            {brand.logoUrl ? (
                                                                <img
                                                                    src={brand.logoUrl}
                                                                    alt={brand.name}
                                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                />
                                                            ) : (
                                                                <Building2 size={20} color="var(--gray-400)" />
                                                            )}
                                                        </div>

                                                        {editingBrand?.id === brand.id ? (
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={editingBrand.name}
                                                                onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                                                                onBlur={handleUpdate}
                                                                onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                                                                autoFocus
                                                                style={{ flex: 1, padding: '0.5rem' }}
                                                            />
                                                        ) : (
                                                            <span style={{ flex: 1, fontWeight: 500 }}>{brand.name}</span>
                                                        )}

                                                        <button
                                                            className="btn btn-ghost btn-icon"
                                                            onClick={() => setEditingBrand(brand)}
                                                            style={{ width: '32px', height: '32px' }}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-icon"
                                                            onClick={() => handleDeleteClick(brand)}
                                                            style={{ width: '32px', height: '32px', color: 'var(--error)' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!confirmDelete}
                onConfirm={confirmDeleteBrand}
                onCancel={() => setConfirmDelete(null)}
                title="Delete brand?"
                message={confirmDelete ? `Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.` : ''}
                confirmText="Remove"
                cancelText="Cancel"
                type="danger"
            />
        </>
    );
}
