import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

const MEETINGS_COLLECTION = 'meetings';

export const meetingService = {
  async addMeeting(meetingData) {
    // meetingData سيحتوي على العنوان، التاريخ، الملاحظات، وسجل الحضور
    return await addDoc(collection(db, MEETINGS_COLLECTION), {
      ...meetingData,
      createdAt: new Date().toISOString()
    });
  },

  async getMeetings() {
    const q = query(collection(db, MEETINGS_COLLECTION), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};