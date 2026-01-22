import imageCompression from 'browser-image-compression';

/**
 * Compression options for product images
 * These settings balance quality and file size for web display
 */
const compressionOptions = {
    maxSizeMB: 0.3,           // Max 300KB per image
    maxWidthOrHeight: 800,    // Max dimension 800px (good for product cards)
    useWebWorker: true,       // Use web worker for better performance
    fileType: 'image/webp',   // WebP format for best compression
    initialQuality: 0.8,      // 80% quality
};

/**
 * Compress an image file before upload
 * @param {File} file - The original image file
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<File>} - Compressed image file
 */
export async function compressImage(file, onProgress = null) {
    try {
        // Skip compression for small files (< 100KB)
        if (file.size < 100 * 1024) {
            console.log('Image already small, skipping compression');
            return file;
        }

        const options = {
            ...compressionOptions,
            onProgress: onProgress ? (progress) => onProgress(progress) : undefined,
        };

        console.log(`Compressing image: ${file.name} (${formatBytes(file.size)})`);

        const compressedFile = await imageCompression(file, options);

        const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
        console.log(
            `Compressed: ${formatBytes(file.size)} → ${formatBytes(compressedFile.size)} (${savings}% smaller)`
        );

        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        // Return original file if compression fails
        return file;
    }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get estimated storage savings info
 * @param {number} originalSize - Original file size in bytes
 * @param {number} compressedSize - Compressed file size in bytes
 */
export function getCompressionStats(originalSize, compressedSize) {
    const saved = originalSize - compressedSize;
    const percentage = ((saved / originalSize) * 100).toFixed(1);
    return {
        original: formatBytes(originalSize),
        compressed: formatBytes(compressedSize),
        saved: formatBytes(saved),
        percentage: `${percentage}%`,
    };
}
