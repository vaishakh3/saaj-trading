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
    getDoc,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { deleteImage } from '../services/supabase';
import toast from 'react-hot-toast';

export function useInventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if Firestore is available
        if (!db) {
            console.log('Firestore not available - using demo mode');
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'inventory'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const inventoryItems = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setItems(inventoryItems);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to load inventory');
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const addItem = async (itemData) => {
        if (!db) {
            toast.error('Database not configured');
            return;
        }

        try {
            await addDoc(collection(db, 'inventory'), {
                ...itemData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            toast.success('Item added successfully!');
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error('Failed to add item');
            throw error;
        }
    };

    const updateItem = async (itemId, itemData) => {
        if (!db) {
            toast.error('Database not configured');
            return;
        }

        try {
            const itemRef = doc(db, 'inventory', itemId);
            await updateDoc(itemRef, {
                ...itemData,
                updatedAt: serverTimestamp(),
            });
            toast.success('Item updated successfully!');
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Failed to update item');
            throw error;
        }
    };

    const deleteItem = async (itemId) => {
        if (!db) {
            toast.error('Database not configured');
            return;
        }

        try {
            // First, get the item to find its image URL
            const itemRef = doc(db, 'inventory', itemId);
            const itemSnap = await getDoc(itemRef);

            if (itemSnap.exists()) {
                const itemData = itemSnap.data();

                // Delete image from Supabase if it exists
                if (itemData.imageUrl) {
                    try {
                        await deleteImage(itemData.imageUrl);
                        console.log('Image deleted from storage');
                    } catch (imgError) {
                        console.error('Failed to delete image:', imgError);
                        // Continue with item deletion even if image deletion fails
                    }
                }
            }

            // Delete the item from Firestore
            await deleteDoc(itemRef);
            toast.success('Item deleted successfully!');
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
            throw error;
        }
    };

    const updateCount = async (itemId, change) => {
        if (!db) {
            toast.error('Database not configured');
            return;
        }

        try {
            const itemRef = doc(db, 'inventory', itemId);
            await updateDoc(itemRef, {
                count: increment(change),
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating count:', error);
            toast.error('Failed to update count');
            throw error;
        }
    };

    const setStock = async (itemId, newCount) => {
        if (!db) {
            toast.error('Database not configured');
            return;
        }

        try {
            const itemRef = doc(db, 'inventory', itemId);
            await updateDoc(itemRef, {
                count: Math.max(0, parseInt(newCount) || 0),
                updatedAt: serverTimestamp(),
            });
            toast.success('Stock updated!');
        } catch (error) {
            console.error('Error setting stock:', error);
            toast.error('Failed to update stock');
            throw error;
        }
    };

    return {
        items,
        loading,
        addItem,
        updateItem,
        deleteItem,
        updateCount,
        setStock,
    };
}
