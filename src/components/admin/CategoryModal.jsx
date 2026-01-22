import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Tag, Upload, CheckCircle } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { uploadImage, supabase } from '../../services/supabase';
import { compressImage } from '../../utils/imageCompression';
import ConfirmModal from '../common/ConfirmModal';
import toast from 'react-hot-toast';

const DEFAULT_COLOR = '#6366F1';

export default function CategoryModal({ isOpen, onClose }) {
    const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
    const [newCategoryName, setNewCategoryName] = useState('');

    const [editingCategory, setEditingCategory] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);
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

    const handleEditImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => setEditImagePreview(reader.result);
        reader.readAsDataURL(file);

        // Compress
        setUploadProgress('Compressing...');
        try {
            const compressed = await compressImage(file);
            setEditImageFile(compressed);
            setUploadProgress('');
        } catch (err) {
            setEditImageFile(file);
            setUploadProgress('');
        }
    };

    const handleAdd = async () => {
        if (!newCategoryName.trim()) return;

        setIsAdding(true);
        try {
            let imageUrl = '';

            if (imageFile && supabase) {
                setUploadProgress('Uploading image...');
                imageUrl = await uploadImage(imageFile, 'categories');
                setUploadProgress('');
            }

            await addCategory({
                name: newCategoryName.trim(),
                color: DEFAULT_COLOR,
                imageUrl,
            });

            // Reset form
            setNewCategoryName('');
            setImageFile(null);
            setImagePreview('');
        } catch (error) {
            console.error('Error adding category:', error);
        } finally {
            setIsAdding(false);
            setUploadProgress('');
        }
    };

    const handleUpdate = async () => {
        if (!editingCategory || !editingCategory.name.trim()) return;

        setIsUpdating(true);
        try {
            let imageUrl = editingCategory.imageUrl;

            // Upload new image if one was selected
            if (editImageFile && supabase) {
                setUploadProgress('Uploading image...');
                imageUrl = await uploadImage(editImageFile, 'categories');
                setUploadProgress('');
            }

            await updateCategory(editingCategory.id, {
                name: editingCategory.name,
                color: editingCategory.color,
                imageUrl,
            });

            // Reset edit state
            setEditingCategory(null);
            setEditImageFile(null);
            setEditImagePreview('');
        } catch (error) {
            console.error('Error updating category:', error);
        } finally {
            setIsUpdating(false);
            setUploadProgress('');
        }
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditImageFile(null);
        setEditImagePreview('');
    };

    const handleDeleteClick = (category) => {
        setConfirmDelete(category);
    };

    const confirmDeleteCategory = async () => {
        if (confirmDelete) {
            try {
                await deleteCategory(confirmDelete.id);
            } catch (error) {
                console.error('Error deleting category:', error);
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
                                <h2>Manage Categories</h2>
                                <button className="modal-close" onClick={onClose}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body">
                                {/* Add New Category */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">Add New Category</label>

                                    {/* Image Upload */}
                                    <div
                                        className="category-image-upload"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            width: '100%',
                                            height: '120px',
                                            border: '2px dashed var(--gray-300)',
                                            borderRadius: 'var(--radius-lg)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            marginBottom: '0.75rem',
                                            overflow: 'hidden',
                                            background: imagePreview ? 'none' : 'var(--gray-50)',
                                        }}
                                    >
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
                                                <Upload size={24} />
                                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                                    Click to add category image
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
                                            placeholder="Category name"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                                            style={{ flex: 1 }}
                                        />
                                        <motion.button
                                            className="btn btn-primary btn-icon"
                                            onClick={handleAdd}
                                            disabled={isAdding || !newCategoryName.trim()}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Plus size={20} />
                                        </motion.button>
                                    </div>

                                </div>

                                {/* Categories List */}
                                <div>
                                    <label className="form-label">Existing Categories</label>
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                                        </div>
                                    ) : categories.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '2rem',
                                            background: 'var(--gray-50)',
                                            borderRadius: 'var(--radius-lg)'
                                        }}>
                                            <Tag size={32} color="var(--gray-300)" />
                                            <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>No categories yet</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                                            <AnimatePresence>
                                                {categories.map((category) => (
                                                    <motion.div
                                                        key={category.id}
                                                        layout
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            padding: '0.75rem',
                                                            background: editingCategory?.id === category.id ? 'var(--gray-100)' : 'var(--gray-50)',
                                                            borderRadius: 'var(--radius-md)',
                                                            border: editingCategory?.id === category.id ? '2px solid var(--primary)' : '2px solid transparent',
                                                        }}
                                                    >
                                                        {/* Category Image Thumbnail - Clickable when editing */}
                                                        <div
                                                            onClick={() => editingCategory?.id === category.id && editFileInputRef.current?.click()}
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                borderRadius: 'var(--radius-md)',
                                                                overflow: 'hidden',
                                                                flexShrink: 0,
                                                                background: category.color || '#6366F1',
                                                                cursor: editingCategory?.id === category.id ? 'pointer' : 'default',
                                                                position: 'relative',
                                                            }}
                                                        >
                                                            {editingCategory?.id === category.id && editImagePreview ? (
                                                                <img
                                                                    src={editImagePreview}
                                                                    alt="New preview"
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : category.imageUrl ? (
                                                                <img
                                                                    src={category.imageUrl}
                                                                    alt={category.name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: 'white',
                                                                    fontSize: '1.25rem',
                                                                    fontWeight: 600,
                                                                }}>
                                                                    {category.name?.charAt(0) || 'C'}
                                                                </div>
                                                            )}
                                                            {editingCategory?.id === category.id && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    inset: 0,
                                                                    background: 'rgba(0,0,0,0.4)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}>
                                                                    <Upload size={16} color="white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {editingCategory?.id === category.id ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={editingCategory.name}
                                                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                                                    onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                                                                    autoFocus
                                                                    style={{ flex: 1, padding: '0.5rem' }}
                                                                />
                                                                <button
                                                                    className="btn btn-primary btn-icon"
                                                                    onClick={handleUpdate}
                                                                    disabled={isUpdating}
                                                                    style={{ width: '32px', height: '32px' }}
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button
                                                                    className="btn btn-ghost btn-icon"
                                                                    onClick={handleCancelEdit}
                                                                    style={{ width: '32px', height: '32px' }}
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span style={{ flex: 1, fontWeight: 500 }}>{category.name}</span>
                                                                <button
                                                                    className="btn btn-ghost btn-icon"
                                                                    onClick={() => setEditingCategory(category)}
                                                                    style={{ width: '32px', height: '32px' }}
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button
                                                                    className="btn btn-ghost btn-icon"
                                                                    onClick={() => handleDeleteClick(category)}
                                                                    style={{ width: '32px', height: '32px', color: 'var(--error)' }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Hidden file input for editing category images */}
                            <input
                                ref={editFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageChange}
                                style={{ display: 'none' }}
                            />

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
                onConfirm={confirmDeleteCategory}
                onCancel={() => setConfirmDelete(null)}
                title="Delete category?"
                message={confirmDelete ? `Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.` : ''}
                confirmText="Remove"
                cancelText="Cancel"
                type="danger"
            />
        </>
    );
}
