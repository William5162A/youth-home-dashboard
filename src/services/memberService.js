import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';

const MEMBERS_COLLECTION = 'members';

export const memberService = {
  async addMember(memberData) {
    return await addDoc(collection(db, MEMBERS_COLLECTION), {
      ...memberData,
      isActive: true,
      createdAt: new Date().toISOString(),
      attendance: [] 
    });
  },

  async getAllMembers() {
    const q = query(collection(db, MEMBERS_COLLECTION), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updateMember(id, updates) {
    const memberRef = doc(db, MEMBERS_COLLECTION, id);
    await updateDoc(memberRef, updates);
  },

  // إضافة دالة الحذف النهائي
  async deleteMember(id) {
    const memberRef = doc(db, MEMBERS_COLLECTION, id);
    await deleteDoc(memberRef);
  }
};