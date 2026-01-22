import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';

export function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'orders'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamp to Date
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            }));
            setOrders(ordersData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        if (!db) return;

        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: new Date(),
            });
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
            throw error;
        }
    };

    const deleteOrder = async (orderId) => {
        if (!db) return;

        try {
            await deleteDoc(doc(db, 'orders', orderId));
            toast.success('Order deleted successfully');
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Failed to delete order');
            throw error;
        }
    };

    return {
        orders,
        loading,
        updateOrderStatus,
        deleteOrder,
    };
}
