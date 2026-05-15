import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

const MEETINGS_COLLECTION = 'meetings';

export const meetingService = {
  async addMeeting(meetingData) {
    return await addDoc(collection(db, MEETINGS_COLLECTION), {
      ...meetingData,
      createdAt: new Date().toISOString()
    });
  },

  async getMeetings() {
    const q = query(collection(db, MEETINGS_COLLECTION), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // الدالة الجديدة المضافة للحذف
  async deleteMeeting(id) {
    const meetingRef = doc(db, MEETINGS_COLLECTION, id);
    await deleteDoc(meetingRef);
  }
};