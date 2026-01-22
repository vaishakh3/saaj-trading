import { useState, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { deleteImage } from '../services/supabase';
import toast from 'react-hot-toast';

export function useBrands() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'brands'), orderBy('name', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const brandList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setBrands(brandList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brands');
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const addBrand = async (brandData) => {
        try {
            await addDoc(collection(db, 'brands'), {
                ...brandData,
                createdAt: serverTimestamp(),
            });
            toast.success('Brand added successfully!');
        } catch (error) {
            console.error('Error adding brand:', error);
            toast.error('Failed to add brand');
            throw error;
        }
    };

    const updateBrand = async (brandId, brandData) => {
        try {
            const brandRef = doc(db, 'brands', brandId);
            await updateDoc(brandRef, brandData);
            toast.success('Brand updated successfully!');
        } catch (error) {
            console.error('Error updating brand:', error);
            toast.error('Failed to update brand');
            throw error;
        }
    };

    const deleteBrand = async (brandId, imageUrl) => {
        try {
            // Delete image from storage if exists
            if (imageUrl) {
                try {
                    await deleteImage(imageUrl);
                } catch (imgError) {
                    console.error('Failed to delete brand image:', imgError);
                }
            }
            await deleteDoc(doc(db, 'brands', brandId));
            toast.success('Brand deleted successfully!');
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error('Failed to delete brand');
            throw error;
        }
    };

    return {
        brands,
        loading,
        addBrand,
        updateBrand,
        deleteBrand,
    };
}
