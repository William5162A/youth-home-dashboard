import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';

export const eventService = {
  // collectionName سيكون إما 'activities' أو 'camps'
  async addEvent(collectionName, eventData) {
    return await addDoc(collection(db, collectionName), {
      ...eventData,
      participantsCount: Number(eventData.participantsCount), // ضمان حفظه كرقم
      rating: Number(eventData.rating), // ضمان حفظه كرقم
      createdAt: new Date().toISOString()
    });
  },

  async getEvents(collectionName) {
    const q = query(collection(db, collectionName), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updateEvent(collectionName, id, updates) {
    const eventRef = doc(db, collectionName, id);
    await updateDoc(eventRef, {
      ...updates,
      participantsCount: updates.participantsCount ? Number(updates.participantsCount) : updates.participantsCount,
      rating: updates.rating ? Number(updates.rating) : updates.rating,
    });
  },

  async deleteEvent(collectionName, id) {
    const eventRef = doc(db, collectionName, id);
    await deleteDoc(eventRef);
  }
};