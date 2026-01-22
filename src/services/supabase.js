import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey;

let supabase = null;

if (isConfigured) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase initialized successfully');
} else {
    console.log('Supabase not configured - image uploads will be disabled');
}

export { supabase };

// Upload image to Supabase Storage
export async function uploadImage(file, folder = 'products') {
    if (!supabase) {
        throw new Error('Supabase not configured');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);
        throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    return publicUrl;
}

// Delete image from Supabase Storage
export async function deleteImage(imageUrl) {
    if (!supabase || !imageUrl) return;

    try {
        // Extract file path from URL
        const urlParts = imageUrl.split('/images/');
        if (urlParts.length < 2) return;

        const filePath = urlParts[1];

        await supabase.storage
            .from('images')
            .remove([filePath]);
    } catch (error) {
        console.error('Delete error:', error);
    }
}
