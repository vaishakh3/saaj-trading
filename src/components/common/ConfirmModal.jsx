import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onConfirm,
    onCancel,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Remove',
    cancelText = 'Cancel',
    type = 'danger' // 'danger' or 'warning'
}) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onCancel}
                style={{ zIndex: 10000 }}
            >
                <motion.div
                    className="confirm-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'white',
                        borderRadius: 'var(--radius-xl)',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-2xl)',
                    }}
                >
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                    }}>
                        <AlertTriangle
                            size={32}
                            color={type === 'danger' ? 'var(--error)' : '#F59E0B'}
                        />
                    </div>

                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: 'var(--gray-900)',
                        marginBottom: '0.5rem',
                    }}>
                        {title}
                    </h3>

                    <p style={{
                        color: 'var(--gray-600)',
                        marginBottom: '1.5rem',
                        fontSize: '0.95rem',
                    }}>
                        {message}
                    </p>

                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'center',
                    }}>
                        <motion.button
                            className="btn btn-secondary"
                            onClick={onCancel}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ flex: 1, maxWidth: '140px' }}
                        >
                            {cancelText}
                        </motion.button>
                        <motion.button
                            className="btn"
                            onClick={onConfirm}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                flex: 1,
                                maxWidth: '140px',
                                background: type === 'danger' ? 'var(--error)' : 'var(--gradient-primary)',
                                color: 'white',
                            }}
                        >
                            {confirmText}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
