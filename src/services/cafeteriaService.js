import { db } from '../lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const MENU_COLLECTION = 'menu_items';
const INVOICES_COLLECTION = 'daily_invoices';

export const cafeteriaService = {
  // ==========================================
  // 1. إدارة قائمة الأصناف (Menu Management)
  // ==========================================
  
  async getMenuItems() {
    const q = query(collection(db, MENU_COLLECTION), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addMenuItem(itemData) {
    // itemData: { name: "متة", price: 5000 }
    return await addDoc(collection(db, MENU_COLLECTION), itemData);
  },

  async updateMenuItem(id, itemData) {
    const itemRef = doc(db, MENU_COLLECTION, id);
    await updateDoc(itemRef, itemData);
  },

  async deleteMenuItem(id) {
    const itemRef = doc(db, MENU_COLLECTION, id);
    await deleteDoc(itemRef);
  },

  // ==========================================
  // 2. إدارة فواتير اليوم (POS Invoices)
  // ==========================================

  async getDailyInvoices() {
    // جلب الفواتير مرتبة من الأحدث للأقدم
    const q = query(collection(db, INVOICES_COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createInvoice(dateStr) {
    const invoiceData = {
      date: dateStr, // التنسيق: YYYY-MM-DD
      status: 'open', // open | closed
      orders: [], // مصفوفة الطلبات اليومية
      totalSales: 0,
      createdAt: new Date().toISOString()
    };
    return await addDoc(collection(db, INVOICES_COLLECTION), invoiceData);
  },

  async updateInvoiceOrders(invoiceId, updatedOrders, newTotal) {
    // هذه الدالة ستستخدم لإضافة طلب جديد أو حذف طلب خاطئ داخل نفس الفاتورة المفتوحة
    const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
    await updateDoc(invoiceRef, {
      orders: updatedOrders,
      totalSales: newTotal
    });
  },

  async closeInvoice(invoiceId, finalTotal) {
    // إغلاق الفاتورة لمنع التعديل عليها لاحقاً
    const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
    await updateDoc(invoiceRef, {
      status: 'closed',
      totalSales: finalTotal
    });
  },
  
  async deleteInvoice(id) {
     const invoiceRef = doc(db, INVOICES_COLLECTION, id);
     await deleteDoc(invoiceRef);
  }
};