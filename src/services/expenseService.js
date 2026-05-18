import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

const EXPENSES_COLLECTION = 'expenses';

export const expenseService = {
  async getExpenses() {
    const q = query(collection(db, EXPENSES_COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addExpense(expenseData) {
    return await addDoc(collection(db, EXPENSES_COLLECTION), {
      ...expenseData,
      createdAt: new Date().toISOString()
    });
  },

  async deleteExpense(id) {
    const expenseRef = doc(db, EXPENSES_COLLECTION, id);
    await deleteDoc(expenseRef);
  }
};