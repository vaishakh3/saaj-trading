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
import toast from 'react-hot-toast';

export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const categoryList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCategories(categoryList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const addCategory = async (categoryData) => {
        try {
            const slug = categoryData.name.toLowerCase().replace(/\s+/g, '-');
            await addDoc(collection(db, 'categories'), {
                ...categoryData,
                slug,
                sortOrder: categories.length + 1,
                createdAt: serverTimestamp(),
            });
            toast.success('Category added successfully!');
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error('Failed to add category');
            throw error;
        }
    };

    const updateCategory = async (categoryId, categoryData) => {
        try {
            const categoryRef = doc(db, 'categories', categoryId);
            const slug = categoryData.name.toLowerCase().replace(/\s+/g, '-');
            await updateDoc(categoryRef, {
                ...categoryData,
                slug,
            });
            toast.success('Category updated successfully!');
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Failed to update category');
            throw error;
        }
    };

    const deleteCategory = async (categoryId) => {
        try {
            await deleteDoc(doc(db, 'categories', categoryId));
            toast.success('Category deleted successfully!');
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
            throw error;
        }
    };

    return {
        categories,
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
    };
}
